// @flow
import { TextFile, ITextFile } from "./TextFile";

export interface IJsonFile<T: Object> extends ITextFile {
  readAsObject(): Promise<T>;
  writeFromObject(fileContent: T): Promise<void>;
}

export class JsonFile<T: Object> extends TextFile implements IJsonFile<T> {
  indent: number;

  constructor(filePath: string, indent?: boolean | number) {
    super(filePath);
    if (typeof indent === "number") {
      this.indent = indent;
    } else if (indent) {
      this.indent = 2;
    }
  }

  static async createFromObject<T: Object>(
    filePath: string,
    fileContent: T,
    indent?: boolean | number
  ): Promise<IJsonFile<T>> {
    const file: JsonFile<T> = new JsonFile(filePath, indent);
    file.unreadUpdates = false;
    await file.writeFromObject(fileContent);
    return file;
  }

  async readAsObject(): Promise<T> {
    const text = await this.readAsString();
    return JSON.parse(text);
  }

  async writeFromObject(fileContent: T): Promise<void> {
    const text = JSON.stringify(fileContent, null, this.indent);
    return this.writeFromString(text);
  }
}
