// @flow
import { resolve as resolvePath, parse as parsePath } from "path";
import { type Readable } from "stream";
import createProgressStream, {
  type StreamProgressCallback
} from "progress-stream";
import { readFile, writeFile, createWriteStream, remove } from "fs-extra";
import RemoteFile from "./RemoteFile";

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
  // The absolute path to the file
  path: string;

  // Just the filename of the file
  name: string;

  // Just the directory that the file resides in
  directory: string;

  encoding: string = "utf8";
  cache: ?T;

  set path(newFilePath: string) {
    const { dir, base } = parsePath(newFilePath);
    this.name = base;
    this.directory = dir;
  }

  get path(): string {
    return resolvePath(this.directory, this.name);
  }

  constructor(path: string, encoding?: ?string) {
    if (!path) {
      throw new Error("File requires a path argument");
    }
    this.path = path;
    if (encoding) {
      this.encoding = encoding;
    }
  }

  static +parse: (rawValue: string) => Promise<T> | T;
  static +serialize: (value: T) => Promise<string> | string;

  static async createFromRemoteFile(
    remoteFile: RemoteFile<T>,
    directory: string,
    name?: ?string,
    encoding?: ?string,
    onProgress?: ?StreamProgressCallback
  ): Promise<TextFile<T>> {
    if (!remoteFile) {
      throw new Error("Remote file required");
    }
    if (!directory) {
      throw new Error("Directory required");
    }
    const readStream = await remoteFile.readStream();
    const nameToUse = name || remoteFile.suggestedFilename;
    const encodingToUse = encoding || remoteFile.suggestedEncoding;
    if (!nameToUse) {
      throw new Error(
        `Cannot create local file from remote URL (${
          remoteFile.url
        }), because no local filename was suggested by the remote server`
      );
    }

    return this.createFromStream(
      resolvePath(directory, nameToUse),
      readStream,
      encodingToUse,
      onProgress,
      remoteFile.expectedLength
    );
  }

  static async createFromStream(
    path: string,
    readStream: Readable,
    encoding?: ?string,
    onProgress?: ?StreamProgressCallback,
    expectedLength?: ?number
  ): Promise<TextFile<T>> {
    const file = new this(path, encoding);
    await file.writeFromStream(readStream, onProgress, expectedLength);
    return file;
  }

  async writeFromStream(
    readStream: Readable,
    onProgress?: ?StreamProgressCallback,
    expectedLength?: ?number
  ): Promise<void> {
    if (onProgress && !expectedLength) {
      throw new Error("Expected length is required to use onProgress");
    }
    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(this.path);
      readStream.on("error", reject);
      writeStream.on("error", reject).on("close", resolve);
      if (onProgress) {
        const progressStream = createProgressStream(
          { time: 100, length: expectedLength },
          onProgress
        );
        readStream.pipe(progressStream).pipe(writeStream);
      } else {
        readStream.pipe(writeStream);
      }
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
    return readFile(this.path, this.encoding);
  }

  async writeRaw(newRawValue: string): Promise<void> {
    return writeFile(this.path, newRawValue, this.encoding);
  }

  async delete(): Promise<void> {
    return remove(this.path);
  }

  // Throw errors here to prevent writing bad data to your file
  static validate(value: T): void {
    if (!value) {
      throw new Error("File must not be empty");
    }
  }
}

export default TextFile;
