// @flow

import TextFile from '../../util/TextFile';

class ProcessIdFile extends TextFile<?number> {
  static async parse(rawValue: string) {
    return rawValue ? parseInt(rawValue, 10) : null;
  }

  static async serialize(value: ?number) {
    return value ? value.toString() : '';
  }

  async readRaw(): Promise<string> {
    try {
      return await super.readRaw();
    } catch (error) {
      if (error.code === 'ENOENT') {
        return '';
      }
      throw error;
    }
  }

  async writeRaw(newValue: string) {
    if (newValue) {
      await super.writeRaw(newValue);
    } else {
      await this.delete();
    }
  }

  static validate(): void {}
}

export default ProcessIdFile;
