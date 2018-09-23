// @flow

import { resolve as resolvePath } from "path";
import SettingsFile, { type Settings } from "./SettingsFile";
import ServerPropertiesFile, {
  type ServerProperties
} from "./ServerPropertiesFile";
import WhitelistFile from "./WhitelistFile";
import OpsFile from "./OpsFile";
import UserCacheFile from "./UserCacheFile";
import InstanceProcess from "./Process";

const PROPERTIES = "server.properties";
const SETTINGS = "instance.json";
const WHITELIST = "whitelist.json";
const OPS = "ops.json";
const USER_CACHE = "usercache.json";

class Instance {
  directory: string;
  settings: SettingsFile;
  properties: ServerPropertiesFile;
  whitelist: WhitelistFile;
  ops: OpsFile;
  userCache: UserCacheFile;
  process: ?InstanceProcess;

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
  }

  static async create(
    directory: string,
    settings: Settings
  ): Promise<Instance> {
    const settingsFile = await SettingsFile.createFromSettings(
      resolvePath(directory, SETTINGS),
      settings
    );
    return new Instance(directory, settingsFile);
  }

  path(...parts: Array<string>): string {
    return resolvePath(this.directory, ...parts);
  }

  // TODO: Maybe merge instanceprocess into this class
  async launch(): Promise<void> {
    if (!this.process) {
      this.process = new InstanceProcess(this.path(), this.settings);
    }
    return this.process.launch();
  }

  async kill(): Promise<void> {
    if (!this.process) {
      throw new Error("Instance has no running process");
    }
    await this.process.kill();
    delete this.process;
  }
}

export default Instance;
