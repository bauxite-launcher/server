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

  constructor(filePath: string, encoding?: string) {
    if (!filePath) {
      throw new Error("File requires a filePath argument");
    }
    this.filePath = filePath;
    if (encoding) {
      this.encoding = encoding;
    }
  }

  static +parse: (rawValue: string) => Promise<T> | T;
  static +serialize: (value: T) => Promise<string> | string;

  // TODO: Write tests
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

  async read(bypassCache: boolean = false): Promise<T> {
    if (bypassCache || this.cache == null) {
      const rawValue: string = await this.readRaw();
      if (this.constructor.parse) {
        this.cache = await this.constructor.parse(rawValue);
      } else {
        // $FlowIgnore – no parse function means T === string
        this.cache = rawValue;
      }
    }
    // $FlowIgnore – see above
    return this.cache;
  }

  async write(newValue: T): Promise<void> {
    this.constructor.validate(newValue);
    this.cache = newValue;
    const rawValue = this.constructor.serialize
      ? await this.constructor.serialize(newValue)
      : newValue;
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

  // Throw errors here to prevent writing bad data to your file
  static validate(value: T): void {
    if (!value) {
      throw new Error("File must not be empty");
    }
  }
}

export default TextFile;
