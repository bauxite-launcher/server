// @flow
import { pathExists } from 'fs-extra';
import {
  type StreamProgressEvent,
  type StreamProgressCallback,
} from 'progress-stream';
import { exec } from 'child_process';
import Instance from './Instance';
import ForgeReleaseList from '../versions/ForgeReleaseList';
import TextFile from '../util/file/TextFile';
import RemoteTextFile from '../util/file/RemoteFile';

export const InstallStage = {
  NotInstalled: Symbol('NotInstalled'),
  Downloading: Symbol('Downloading'),
  Installing: Symbol('Installing'),
  Installed: Symbol('Installed'),
};

export type InstallStageType =
  | typeof InstallStage.Downloading
  | typeof InstallStage.NotInstalled
  | typeof InstallStage.Installing
  | typeof InstallStage.Installed;

export type InstallState =
  | {
      stage:
        | typeof InstallStage.NotInstalled
        | typeof InstallStage.Installing
        | typeof InstallStage.Installed,
      progress?: void,
    }
  | { stage: typeof InstallStage.Downloading, progress: ?StreamProgressEvent };

export type InstallStateSubscriber = (newState: InstallState) => void;

// TODO: Download + extract dependencies manually
class ForgeInstaller {
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
    return this.forgeJarExists();
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

  async install(forgeVersion: string, force: boolean = false): Promise<void> {
    if (!(await this.instance.isInstalled())) {
      throw new Error('Instance is not yet installed');
    }

    if (!force && (await this.isInstalled())) {
      const settings = await this.instance.settings.read();
      throw new Error(
        `Forge version ${settings.forgeVersion || 'unknown'} is ${
          forgeVersion === settings.forgeVersion ? 'already' : 'currently'
        } installed on this instance`,
      );
    }

    const forgeJarExists = await this.forgeJarExists();
    if (force || !forgeJarExists) {
      this.setState(InstallStage.Downloading);
      await this.downloadForgeInstaller(forgeVersion, progress => this.setState(InstallStage.Downloading, progress));

      this.setState(InstallStage.Installing);
      await this.runForgeInstaller(forgeVersion);
    }

    this.setState(InstallStage.Installed);
  }

  async forgeJarExists(): Promise<boolean> {
    const settings = await this.instance.settings.read();
    if (!settings.forgeJar) return false;
    return pathExists(this.instance.path(settings.forgeJar));
  }

  async downloadForgeInstaller(
    forgeVersion: string,
    onProgress?: StreamProgressCallback,
  ): Promise<void> {
    if (!forgeVersion) {
      throw new Error('Forge version must be specified');
    }

    const forgeRelease = await ForgeReleaseList.getReleaseById(forgeVersion);

    if (!forgeRelease || !forgeRelease.files || !forgeRelease.files.installer) {
      throw new Error(
        `Could not find a download URL for Forge v${forgeVersion} installer `,
      );
    }

    const { minecraftVersion } = await this.instance.settings.read();

    await TextFile.createFromRemoteFile(
      new RemoteTextFile(forgeRelease.files.installer.url),
      this.instance.path(),
      `forge-${minecraftVersion}-${forgeVersion}-installer.jar`,
      null,
      onProgress,
    );
  }

  async runForgeInstaller(forgeVersion: string): Promise<void> {
    const {
      minecraftVersion,
      javaBin = 'java',
    } = await this.instance.settings.read();
    if (!forgeVersion) {
      throw new Error('Forge version must be specified');
    }
    const installerJarPath = this.instance.path(
      `forge-${minecraftVersion}-${forgeVersion}-installer.jar`,
    );
    await new Promise((resolve, reject) => {
      exec(
        `${javaBin} -jar ${installerJarPath} --installServer`,
        { cwd: this.instance.path(), encoding: 'utf8' },
        (err: ?Error, stdout: ?string | Buffer, stderr: ?string | Buffer) => {
          const error = err || stderr;
          if (error) reject(error);
          else {
            resolve({
              stdout: stdout && stdout.toString(),
              stderr: stderr && stderr.toString(),
            });
          }
        },
      );
    });

    await this.instance.settings.patch({
      forgeVersion,
      forgeJar: `forge-${minecraftVersion}-${forgeVersion}-universal.jar`,
    });
  }
}

export default ForgeInstaller;
