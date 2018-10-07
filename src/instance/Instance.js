// @flow

import { resolve as resolvePath } from 'path';
import SettingsFile, { type Settings } from './files/SettingsFile';
import ServerPropertiesFile from './files/ServerPropertiesFile';
import WhitelistFile from './files/WhitelistFile';
import OpsFile from './files/OpsFile';
import UserCacheFile from './files/UserCacheFile';
import EulaFile from './files/EulaFile';
import InstanceProcess from './Process';
import Installer, {
  type InstallState,
  type InstallStateSubscriber,
} from './Installer';
import LogManager from './LogManager';

const PROPERTIES = 'server.properties';
const SETTINGS = 'instance.json';
const WHITELIST = 'whitelist.json';
const OPS = 'ops.json';
const USER_CACHE = 'usercache.json';
const EULA = 'eula.txt';
const LOGS_DIR = 'logs';

class Instance {
  directory: string;

  settings: SettingsFile;

  properties: ServerPropertiesFile;

  whitelist: WhitelistFile;

  ops: OpsFile;

  userCache: UserCacheFile;

  eula: EulaFile;

  processCache: ?InstanceProcess;

  process: InstanceProcess;

  installerCache: ?Installer;

  installer: Installer;

  logsCache: ?LogManager;

  logs: LogManager;

  constructor(
    directory: string,
    settings?: SettingsFile,
    properties?: ServerPropertiesFile,
  ) {
    this.directory = directory;
    this.settings = settings || new SettingsFile(this.path(SETTINGS));
    this.properties = properties || new ServerPropertiesFile(this.path(PROPERTIES));
    this.whitelist = new WhitelistFile(this.path(WHITELIST));
    this.ops = new OpsFile(this.path(OPS));
    this.userCache = new UserCacheFile(this.path(USER_CACHE));
    this.eula = new EulaFile(this.path(EULA));
  }

  static async create(
    directory: string,
    settings: Settings,
    onProgress?: ?InstallStateSubscriber,
  ): Promise<Instance> {
    const settingsFile = new SettingsFile(resolvePath(directory, SETTINGS));
    const instance = new this(directory, settingsFile);
    await instance.install(settings.minecraftVersion, onProgress);
    return instance;
  }

  path(...parts: Array<string>): string {
    return resolvePath(this.directory, ...parts);
  }

  createProcess(): InstanceProcess {
    const newProcess = new InstanceProcess(this.path(), this.settings);
    this.processCache = newProcess;
    return newProcess;
  }

  get process() {
    return this.processCache || this.createProcess();
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
    this.installerCache = newInstaller;
    return newInstaller;
  }

  get installer() {
    return this.installerCache || this.createInstaller();
  }

  async getInstallState(): Promise<InstallState> {
    return this.installer.getState();
  }

  async isInstalled(): Promise<boolean> {
    return this.installer.isInstalled();
  }

  async install(
    minecraftVersionId: string,
    onProgress?: ?InstallStateSubscriber,
    force?: boolean = false,
  ): Promise<void> {
    const unsubscribe = onProgress && this.installer.subscribe(onProgress);
    const result = await this.installer.install(minecraftVersionId, force);
    if (unsubscribe) {
      unsubscribe();
    }
    return result;
  }

  createLogManager(): LogManager {
    const newLogManager = new LogManager(this.path(LOGS_DIR));
    this.logsCache = newLogManager;
    return newLogManager;
  }

  get logs(): LogManager {
    return this.logsCache || this.createLogManager();
  }
}

export default Instance;
