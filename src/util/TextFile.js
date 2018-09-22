// @flow
import { File, type IFile } from "./File";

export interface ITextFile extends IFile {
  readAsString(): Promise<string>;
  writeFromString(fileContent: string): Promise<void>;
}

type TextFileEncoding = "utf8" | "ascii" | "hex";

export class TextFile extends File implements ITextFile {
  encoding: TextFileEncoding;

  constructor(filePath: string, encoding: TextFileEncoding = "utf8") {
    super(filePath);
    this.encoding = encoding;
  }

  static async createFromString(
    filePath: string,
    fileContent: string,
    encoding?: TextFileEncoding
  ): Promise<ITextFile> {
    const file = new TextFile(filePath);
    file.unreadUpdates = false;
    await file.writeFromString(fileContent);
    return file;
  }

  async readAsString(): Promise<string> {
    const buffer = await this.readAsBuffer();
    return buffer.toString(this.encoding);
  }

  async writeFromString(fileContent: string): Promise<void> {
    const buffer = Buffer.from(fileContent, this.encoding);
    return this.writeFromBuffer(buffer);
  }
}
