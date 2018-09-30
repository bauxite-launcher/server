// @flow
import { pathExists, ensureDir } from "fs-extra";
import Instance from "./Instance";
import MinecraftRelease from "../versions/MinecraftReleaseFile";
import { type Settings, type PartialSettings } from "./files/SettingsFile";
import RemoteFile from "../util/RemoteFile";
import TextFile from "../util/TextFile";

export const InstallStage = {
  NotInstalled: Symbol("NotInstalled"),
  Preparing: Symbol("Preparing"),
  Downloading: Symbol("Downloading"),
  Configuring: Symbol("Configuring"),
  Installed: Symbol("Installed")
};

export type InstallStageType = $Values<typeof InstallStage>;

export type InstallProgress = {
  total: number,
  current: number,
  percent: number
};

export type InstallState =
  | { stage: typeof InstallStage.NotInstalled }
  | { stage: typeof InstallStage.Preparing }
  | { stage: typeof InstallStage.Downloading, progress: ?InstallProgress }
  | { stage: typeof InstallStage.Configuring }
  | { stage: typeof InstallStage.Installed };

class Installer {
  instance: Instance;
  state: InstallState;

  setState(stage: InstallStageType, progress?: InstallProgress): void {
    this.state = { stage, progress };

    if (this.state.progress) {
      this.state.progress.percent =
        this.state.progress.current / this.state.progress.total;
    }
  }

  constructor(instance: Instance) {
    if (!instance) {
      throw new Error("Installer requires an instance");
    }
    this.instance = instance;
  }

  async isInstalled(): Promise<boolean> {
    return (
      (await this.directoryExists()) &&
      ((await this.serverJarExists()) && (await this.eulaAgreed()))
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
      stage: isInstalled ? InstallStage.Installed : InstallStage.NotInstalled
    };
  }

  async install(settings: Settings, force: boolean = false): Promise<void> {
    if (!force && (await this.getState()).stage === InstallStage.Installed) {
      throw new Error("Instance is already installed");
    }

    // Create dir
    this.setState(InstallStage.Preparing);
    await this.ensureDirectoryExists();
    await this.writeSettings(settings);

    // Download
    this.setState(InstallStage.Downloading);
    if (force || !(await this.serverJarExists())) {
      await this.downloadServerJar();
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
    return await pathExists(this.instance.path(serverJar));
  }

  async downloadServerJar(): Promise<void> {
    const { minecraftVersion } = await this.instance.settings.read();
    if (!minecraftVersion) {
      throw new Error("Minecraft version must be specified!");
    }

    const { downloads } = await MinecraftRelease.fromReleaseId(
      minecraftVersion
    );
    if (!downloads || !downloads.server) {
      throw new Error(
        `No server JAR file available for Minecraft v${minecraftVersion}`
      );
    }

    const serverJarFile = await TextFile.createFromRemoteFile(
      new RemoteFile(downloads.server.url),
      this.instance.path(),
      `minecraft_server.${minecraftVersion}.jar`
    );

    await this.writeSettings({
      minecraftVersion,
      serverJar: serverJarFile.name
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

export default Installer;
