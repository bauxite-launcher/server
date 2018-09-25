// @flow

import JsonFile from "../../util/JsonFile";

export type Settings = {
  name: string,
  minecraftVersion: string,
  serverJar: string,
  javaArgs?: Array<string>,
  javaBin?: string
};

class SettingsFile extends JsonFile<Settings> {
  static validate(settings: Settings) {
    super.validate(settings);

    if (typeof settings !== "object") {
      throw new Error("Settings must be an object");
    }
    if (!settings.name || typeof settings.name !== "string") {
      throw new Error("Instance must have a name, and it must be a string");
    }
    if (
      !settings.minecraftVersion ||
      typeof settings.minecraftVersion !== "string"
    ) {
      throw new Error(
        "Instance must have a minecraftVersion, and it must be a string"
      );
    }
    if (!settings.serverJar || typeof settings.serverJar !== "string") {
      throw new Error(
        "Instance must have a serverJar, and it must be a string"
      );
    }
    if (
      settings.javaArgs != null &&
      (!(settings.javaArgs instanceof Array) ||
        !settings.javaArgs.every(arg => arg && typeof arg === "string"))
    ) {
      throw new Error(
        "Instance must have javaArgs as an array of strings, if provided."
      );
    }
  }
}

export default SettingsFile;
