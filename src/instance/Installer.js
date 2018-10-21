// @flow
import { pathExists, ensureDir } from 'fs-extra';
import {
  type StreamProgressEvent,
  type StreamProgressCallback,
} from 'progress-stream';
import Instance from './Instance';
import MinecraftRelease from '../versions/MinecraftRelease';
import { type PartialSettings } from './files/SettingsFile';
import RemoteFile from '../util/file/RemoteFile';
import TextFile from '../util/file/TextFile';

export const InstallStage = {
  NotInstalled: Symbol('NotInstalled'),
  Downloading: Symbol('Downloading'),
  Configuring: Symbol('Configuring'),
  Installed: Symbol('Installed'),
};

export type InstallStageType =
  | typeof InstallStage.Downloading
  | typeof InstallStage.NotInstalled
  | typeof InstallStage.Configuring
  | typeof InstallStage.Installed;

export type InstallState =
  | {
      stage:
        | typeof InstallStage.NotInstalled
        | typeof InstallStage.Configuring
        | typeof InstallStage.Installed,
      progress?: void,
    }
  | { stage: typeof InstallStage.Downloading, progress: ?StreamProgressEvent };

export type InstallStateSubscriber = (newState: InstallState) => void;

class InstanceAlreadyInstalledError extends Error {
  instance: Instance;

  constructor(instance: Instance) {
    super();
    this.instance = instance;
    this.message = this.generateMessage();
  }

  generateMessage() {
    return `Cannot install a fresh instance of Minecraft, because there is an existing installation:
  - Path: ${this.instance.path()}`;
  }
}

class NoServerJarAvailableError extends Error {
  instance: Instance;

  minecraftVersion: string;

  downloads: Object;

  constructor(instance: Instance, minecraftVersion: string, downloads: Object) {
    super();
    this.instance = instance;
    this.minecraftVersion = minecraftVersion;
    this.downloads = downloads;
    this.message = this.generateMessage();
  }

  generateMessage() {
    return `No download URL was provided for the server binary in the Minecraft ${
      this.minecraftVersion
    } release manifest:

Expected download manifest to be an object containing a string at "server.url" but instead got:

${JSON.stringify(this.downloads)}`;
  }
}
class MinecraftInstaller {
  instance: Instance;

  state: InstallState;

  subscribers: Array<InstallStateSubscriber> = [];

  constructor(instance: Instance) {
    if (!instance) {
      throw new Error(`${this.constructor.name} requires an instance`);
    }
    this.instance = instance;
  }

  setState(stage: InstallStageType, progress?: StreamProgressEvent): void {
    this.state = { stage, progress };
    this.subscribers.forEach(subscriber => subscriber(this.state));
  }

  subscribe(subscriber: InstallStateSubscriber): () => void {
    this.subscribers.push(subscriber);
    return () => {
      this.subscribers = this.subscribers.filter(item => item !== subscriber);
    };
  }

  async isInstalled(): Promise<boolean> {
    return (
      (await this.directoryExists())
      && ((await this.serverJarExists()) && this.eulaAgreed())
    );
  }

  async getState(): Promise<InstallState> {
    if (!this.state) {
      this.state = await this.readRawState();
    }
    return this.state;
  }

  async readRawState(): Promise<InstallState> {
    const isInstalled = await this.isInstalled();
    return {
      stage: isInstalled ? InstallStage.Installed : InstallStage.NotInstalled,
    };
  }

  async install(
    minecraftVersion: string,
    force: boolean = false,
  ): Promise<void> {
    await this.ensureDirectoryExists();
    if (!force && (await this.getState()).stage === InstallStage.Installed) {
      throw new InstanceAlreadyInstalledError(this.instance);
    }

    // Download
    this.setState(InstallStage.Downloading);
    if (force || !(await this.serverJarExists())) {
      await this.downloadServerJar(minecraftVersion, progress => this.setState(InstallStage.Downloading, progress));
    }

    // Eula
    this.setState(InstallStage.Configuring);
    if (force || !(await this.eulaAgreed())) {
      await this.agreeToEula();
    }

    this.setState(InstallStage.Installed);
  }

  async directoryExists(): Promise<boolean> {
    return pathExists(this.instance.path());
  }

  async ensureDirectoryExists(): Promise<void> {
    await ensureDir(this.instance.path());
  }

  async serverJarExists(): Promise<boolean> {
    const { serverJar } = await this.instance.settings.read();
    if (!serverJar) return false;
    return pathExists(this.instance.path(serverJar));
  }

  async downloadServerJar(
    minecraftVersion: string,
    onProgress?: StreamProgressCallback,
  ): Promise<void> {
    if (!minecraftVersion) {
      throw new Error('Minecraft version must be specified!');
    }

    const { downloads } = await MinecraftRelease.fromReleaseId(
      minecraftVersion,
    );
    if (!downloads || !downloads.server || !downloads.server.url) {
      throw new NoServerJarAvailableError(
        this.instance,
        minecraftVersion,
        downloads,
      );
    }

    const serverJarFile = await TextFile.createFromRemoteFile(
      new RemoteFile(downloads.server.url),
      this.instance.path(),
      `minecraft_server.${minecraftVersion}.jar`,
      null,
      onProgress,
    );

    await this.writeSettings({
      minecraftVersion,
      serverJar: serverJarFile.name,
    });
  }

  async eulaAgreed(): Promise<boolean> {
    return this.instance.eula.read();
  }

  async agreeToEula(): Promise<void> {
    return this.instance.eula.accept();
  }

  async writeSettings(settings: PartialSettings): Promise<void> {
    return this.instance.settings.patch(settings);
  }
}

export default MinecraftInstaller;
