// @flow

import JsonFile from '../../util/file/JsonFile';

export type ForgeSettings = {
  forgeVersion?: string,
  forgeJar?: string,
};

export type Settings = {
  name: string,
  minecraftVersion: string,
  serverJar?: string,
  javaArgs?: Array<string>,
  javaBin?: string,
} & ForgeSettings;

export type PartialSettings = $Shape<Settings>; // eslint-disable-line no-undef

class SettingsFile extends JsonFile<Settings> {
  static validate(settings: Settings) {
    super.validate(settings);

    if (typeof settings !== 'object' || settings == null) {
      throw new Error('Settings must be an object');
    }

    const {
      name,
      minecraftVersion,
      serverJar,
      javaArgs,
      javaBin,
      forgeVersion,
      forgeJar,
    } = settings;

    if (!name || typeof name !== 'string') {
      throw new Error(
        'Instance must have a name, and it must be a non-empty string',
      );
    }
    if (!minecraftVersion || typeof minecraftVersion !== 'string') {
      throw new Error(
        'Instance must have a minecraftVersion, and it must be a non-empty string',
      );
    }
    if (serverJar && typeof serverJar !== 'string') {
      throw new Error(
        'Instance must have a serverJar, and it must be a non-empty string',
      );
    }
    if (
      javaArgs != null
      && (!(javaArgs instanceof Array)
        || !javaArgs.every(arg => arg && typeof arg === 'string'))
    ) {
      throw new Error(
        'Instance must have javaArgs as an array of non-empty strings, if provided.',
      );
    }

    if (javaBin && typeof javaBin !== 'string') {
      throw new Error(
        'Instance must have javaBin as a non-empty string, if provided',
      );
    }

    if (forgeVersion || forgeJar) {
      if (!(forgeVersion && forgeJar)) {
        throw new Error(
          'Both (or neither) of forgeVersion and forgeJar must be specified',
        );
      }
      if (!forgeVersion || typeof forgeVersion !== 'string') {
        throw new Error(
          'Instance must have forgeVersion as a non-empty string',
        );
      }
      if (!forgeJar || typeof forgeJar !== 'string') {
        throw new Error('Instance must have forgeJar as a non-empty string');
      }
    }
  }

  async read(): Promise<Settings> {
    try {
      return await super.read();
    } catch (error) {
      if (error.code === 'ENOENT') {
        // $FlowIgnore
        return { name: 'Unnamed Instance' };
      }
      throw error;
    }
  }

  async patch(partialSettings: PartialSettings): Promise<void> {
    await this.update(oldSettings => ({ ...oldSettings, ...partialSettings }));
  }
}

export default SettingsFile;
