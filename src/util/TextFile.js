// @flow
import { resolve as resolvePath } from "path";
import { type Readable } from "stream";
import RemoteFile from "./RemoteFile";
import { readFile, writeFile, createWriteStream, remove } from "fs-extra";

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
    readStream: Readable,
    encoding?: string
  ): Promise<TextFile<T>> {
    const file = new this(filePath, encoding);
    await file.writeFromStream(readStream);
    return file;
  }

  static async createFromRemoteFile(
    remoteFile: RemoteFile<T>,
    directory: string,
    filePath?: string,
    encoding?: string
  ): Promise<TextFile<T>> {
    if (!remoteFile) {
      throw new Error("Remote file required");
    }
    if (!directory) {
      throw new Error("Directory required");
    }
    const readStream = await remoteFile.readStream();
    const filePathToUse = filePath || remoteFile.suggestedFilename;
    const encodingToUse = encoding || remoteFile.suggestedEncoding || undefined;
    if (!filePathToUse) {
      throw new Error(
        `Cannot create local file from remote URL (${
          remoteFile.url
        }), because no local filename was suggested by the remote server`
      );
    }

    return this.createFromStream(
      resolvePath(directory, filePathToUse),
      readStream,
      encodingToUse
    );
  }

  async writeFromStream(readStream: Readable): Promise<void> {
    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(this.filePath);
      readStream.on("error", reject);
      writeStream.on("error", reject).on("close", resolve);
      readStream.pipe(writeStream);
    });
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
