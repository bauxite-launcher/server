// @flow

import { resolve as resolvePath } from "path";
import SettingsFile, { type Settings } from "./SettingsFile";
import ServerPropertiesFile, {
  type ServerProperties
} from "./ServerPropertiesFile";

const PROPERTIES = "server.properties";
const SETTINGS = "instance.json";

class Instance {
  directory: string;
  settings: SettingsFile;
  properties: ServerPropertiesFile;

  constructor(
    directory: string,
    settings?: SettingsFile,
    properties?: ServerPropertiesFile
  ) {
    this.directory = directory;
    this.settings = settings || new SettingsFile(this.path(SETTINGS));
    this.properties =
      properties || new ServerPropertiesFile(this.path(PROPERTIES));
  }

  static async create(
    directory: string,
    settings: Settings,
    properties?: ServerProperties
  ): Promise<Instance> {
    const settingsFile = await SettingsFile.createFromSettings(
      resolvePath(directory, SETTINGS),
      settings
    );
    const propertiesFile =
      properties &&
      (await ServerPropertiesFile.createFromProperties(
        resolvePath(directory, PROPERTIES),
        properties
      ));
    return new Instance(directory, settingsFile, propertiesFile);
  }

  path(...parts: Array<string>): string {
    return resolvePath(this.directory, ...parts);
  }
}

export default Instance;
