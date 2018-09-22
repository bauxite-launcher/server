// @flow

import { JsonFile } from "../util/JsonFile";

export type Settings = {
  name: string,
  minecraftVersion: string,
  javaArgs?: Array<string>,
  javaBin?: string
};

export type SettingsPatch = {
  name?: string,
  minecraftVersion?: string
};

class SettingsFile extends JsonFile<Settings> {
  async readSettings(): Promise<Settings> {
    return this.readAsObject();
  }

  async writeSettings(newSettings: Settings): Promise<void> {
    this.constructor.validateSettings(newSettings);
    return this.writeFromObject(newSettings);
  }

  async updateSettings(settingsPatch: SettingsPatch): Promise<void> {
    const oldSettings = await this.readSettings();
    const newSettings = Object.assign({}, oldSettings, settingsPatch);
    return this.writeSettings(newSettings);
  }

  static async createFromSettings(
    filePath: string,
    props: Settings
  ): Promise<SettingsFile> {
    const file = new SettingsFile(filePath);
    file.unreadUpdates = false;
    await file.writeSettings(props);
    return file;
  }

  static validateSettings(settings: Settings): void {
    // TODO
  }
}

export default SettingsFile;
