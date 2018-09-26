// @flow
import TextFile, { ReadableFile } from "./TextFile";

export const asReadableJsonFile = <T: any>(BaseClass: *) =>
  class ReadableJsonFile<T> extends BaseClass<T> {
    static async parse(rawValue: string) {
      return JSON.parse(rawValue);
    }
  };

export const asWritableJsonFile = <T: any>(BaseClass: *) => {
  const ReadableJsonBaseClass: BaseClass<T> = asReadableJsonFile(BaseClass);
  return class WritableJsonFile<T> extends ReadableJsonBaseClass {
    static async serialize(value: T) {
      return JSON.stringify(value, null, 2);
    }
  };
};

export const ReadableJsonFile = asReadableJsonFile(TextFile);
export const WritableJsonFile = asWritableJsonFile(TextFile);

export default WritableJsonFile;
