// @flow

import { resolve as resolvePath } from "path";
import SettingsFile, { type Settings } from "./files/SettingsFile";
import ServerPropertiesFile, {
  type ServerProperties
} from "./files/ServerPropertiesFile";
import WhitelistFile from "./files/WhitelistFile";
import OpsFile from "./files/OpsFile";
import UserCacheFile from "./files/UserCacheFile";
import EulaFile from "./files/EulaFile";
import InstanceProcess from "./Process";
import Installer, {
  InstallStage,
  type InstallStageType,
  type InstallState
} from "./Installer";

const PROPERTIES = "server.properties";
const SETTINGS = "instance.json";
const WHITELIST = "whitelist.json";
const OPS = "ops.json";
const USER_CACHE = "usercache.json";
const EULA = "eula.txt";

class Instance {
  directory: string;
  settings: SettingsFile;
  properties: ServerPropertiesFile;
  whitelist: WhitelistFile;
  ops: OpsFile;
  userCache: UserCacheFile;
  eula: EulaFile;
  _process: ?InstanceProcess;
  process: InstanceProcess;
  _installer: ?Installer;
  installer: Installer;

  constructor(
    directory: string,
    settings?: SettingsFile,
    properties?: ServerPropertiesFile
  ) {
    this.directory = directory;
    this.settings = settings || new SettingsFile(this.path(SETTINGS));
    this.properties =
      properties || new ServerPropertiesFile(this.path(PROPERTIES));
    this.whitelist = new WhitelistFile(this.path(WHITELIST));
    this.ops = new OpsFile(this.path(OPS));
    this.userCache = new UserCacheFile(this.path(USER_CACHE));
    this.eula = new EulaFile(this.path(EULA));
  }

  static async create(
    directory: string,
    settings: Settings
  ): Promise<Instance> {
    const settingsFile = new SettingsFile(resolvePath(directory, SETTINGS));
    const instance = new this(directory, settingsFile);
    await instance.install(settings.minecraftVersion);
    return instance;
  }

  path(...parts: Array<string>): string {
    return resolvePath(this.directory, ...parts);
  }

  createProcess(): InstanceProcess {
    const newProcess = new InstanceProcess(this.path(), this.settings);
    this._process = newProcess;
    return newProcess;
  }

  get process() {
    return this._process || this.createProcess();
  }

  async launch(): Promise<void> {
    return this.process.launch();
  }

  async kill(): Promise<void> {
    await this.process.kill();
    delete this.process;
  }

  async isRunning(): Promise<boolean> {
    const isRunning = await this.process.isRunning();
    if (!isRunning) {
      delete this.process;
    }
    return isRunning;
  }

  createInstaller(): Installer {
    const newInstaller = new Installer(this);
    this._installer = newInstaller;
    return newInstaller;
  }

  get installer() {
    return this._installer || this.createInstaller();
  }

  async getInstallState(): Promise<InstallState> {
    return this.installer.getState();
  }

  async isInstalled(): Promise<boolean> {
    return this.installer.isInstalled();
  }

  async install(minecraftVersionId: string): Promise<void> {
    return this.installer.install(minecraftVersionId);
  }
}

export default Instance;
