// @flow

import TextFile from './TextFile';

class JsonFile<T: any> extends TextFile<T> {
  static async parse(rawValue: string) {
    return JSON.parse(rawValue);
  }

  static async serialize(value: T) {
    return JSON.stringify(value, null, 2);
  }

  async update(updateFn: (previousValue: T) => Promise<T> | T): Promise<void> {
    const previousValue = await this.read();
    const nextValue = await updateFn(previousValue);
    await this.write(nextValue);
  }
}

export default JsonFile;
