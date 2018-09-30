// @flow

import JsonFile from "../../util/JsonFile";

export type Settings = {
  name: string,
  minecraftVersion: string,
  serverJar: string,
  javaArgs?: Array<string>,
  javaBin?: string
};

export type PartialSettings = {
  name?: string,
  minecraftVersion?: string,
  serverJar?: string,
  javaArgs?: Array<string>,
  javaBin?: string
};

class SettingsFile extends JsonFile<Settings> {
  static validate(settings: Settings) {
    super.validate(settings);

    if (typeof settings !== "object" || settings == null) {
      throw new Error("Settings must be an object");
    }

    const { name, minecraftVersion, serverJar, javaArgs, javaBin } = settings;

    if (!name || typeof name !== "string") {
      throw new Error(
        "Instance must have a name, and it must be a non-empty string"
      );
    }
    if (!minecraftVersion || typeof minecraftVersion !== "string") {
      throw new Error(
        "Instance must have a minecraftVersion, and it must be a non-empty string"
      );
    }
    if (!serverJar || typeof serverJar !== "string") {
      throw new Error(
        "Instance must have a serverJar, and it must be a non-empty string"
      );
    }
    if (
      javaArgs != null &&
      (!(javaArgs instanceof Array) ||
        !javaArgs.every(arg => arg && typeof arg === "string"))
    ) {
      throw new Error(
        "Instance must have javaArgs as an array of non-empty strings, if provided."
      );
    }

    if (javaBin && typeof javaBin !== "string") {
      throw new Error(
        "Instance must have javaBin as a non-empty string, if provided"
      );
    }
  }

  async patch(partialSettings: PartialSettings): Promise<void> {
    await this.update(oldSettings => ({ ...oldSettings, ...partialSettings }));
  }
}

export default SettingsFile;
