// @flow

import TextFile from "./TextFile";

class JsonFile<T: any> extends TextFile<T> {
  static async parse(rawValue: string) {
    return JSON.parse(rawValue);
  }
  static async serialize(value: T) {
    return JSON.stringify(value, null, 2);
  }
}

export default JsonFile;
