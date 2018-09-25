// @flow
import { readFile, writeFile, createWriteStream, remove } from "fs-extra";
import { type Readable } from "stream";

export interface ReadableFile<T> {
  read(): Promise<T>;
  readRaw(): Promise<string>;
}

export interface WriteableFile<T> {
  write(newValue: T): Promise<void>;
  writeRaw(newRawValue: string): Promise<void>;
  delete(): Promise<void>;
}

class TextFile<T: any = string> implements ReadableFile<T>, WriteableFile<T> {
  filePath: string;
  encoding: string = "utf8";
  cache: ?T;
  needsWrite: boolean = false;
  needsRead: boolean = true;

  constructor(filePath: string, encoding?: string) {
    if (!filePath) {
      throw new Error("File requires a filePath argument");
    }
    this.filePath = filePath;
    if (encoding) {
      this.encoding = encoding;
    }
  }

  static async createFromStream(
    filePath: string,
    contentStream: Readable,
    encoding?: string
  ): Promise<TextFile<T>> {
    const writeStream = createWriteStream(filePath);
    await new Promise((resolve, reject) => {
      writeStream.on("error", reject).on("end", resolve);
      contentStream.pipe(writeStream);
    });
    return new this(filePath, encoding);
  }

  async read(): Promise<T> {
    if (this.needsRead || this.cache == null) {
      const rawValue = await this.readRaw();
      this.cache = await this.constructor.parse(rawValue);
    }
    return this.cache;
  }

  async write(newValue: T): Promise<void> {
    this.constructor.validate(newValue);
    const rawValue = await this.constructor.serialize(newValue);
    return this.writeRaw(rawValue);
  }

  async readRaw(): Promise<string> {
    return readFile(this.filePath, this.encoding);
  }

  async writeRaw(newRawValue: string): Promise<void> {
    return writeFile(this.filePath, newRawValue, this.encoding);
  }

  async delete(): Promise<void> {
    return remove(this.filePath);
  }

  // Override these methods to implement a new TextFile:
  static async parse(rawValue: string): Promise<T> {
    // $FlowIgnore -- this is a (slightly) abstract class which we can also instantiate concretely
    return rawValue;
  }
  static async serialize(value: T): Promise<string> {
    return value;
  }
  // Throw errors here to prevent writing bad data to your file
  static validate(value: T): void {
    if (!value) {
      throw new Error("File must not be empty");
    }
  }
}

export default TextFile;
