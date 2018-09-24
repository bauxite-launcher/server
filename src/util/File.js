// @flow
import {
  readFile,
  writeFile,
  createWriteStream,
  mkdirp,
  remove
} from "fs-extra";
import { type Readable } from "stream";
import { dirname } from "path";

export interface IFile {
  readAsBuffer(): Promise<Buffer>;
  writeFromBuffer(fileContent: Buffer): Promise<void>;
  writeFromStream(fileStream: Readable): Promise<void>;
  needsFetch(): Promise<boolean>;
  needsFlush(): Promise<boolean>;
  flushToDisk(): Promise<void>;
  fetchFromDisk(): Promise<void>;
}

export class File implements IFile {
  filePath: string;
  _cache: ?Buffer;
  unwrittenChanges: boolean;
  unreadUpdates: boolean;

  get cache(): Buffer {
    if (!this._cache) {
      throw new Error("File cache not populated");
    }
    return this._cache;
  }

  set cache(cache: Buffer) {
    this._cache = cache;
    this.unwrittenChanges = true;
  }

  constructor(filePath: string) {
    if (!filePath) {
      throw new Error("File requires a path");
    }
    this.filePath = filePath;
    this.unreadUpdates = true;
    this.unwrittenChanges = false;
  }

  static async createFromStream(
    filePath: string,
    fileStream: Readable
  ): Promise<File> {
    await mkdirp(dirname(filePath));
    const file = new this(filePath);
    file.unreadUpdates = false;
    await file.writeFromStream(fileStream);
    return file;
  }

  static async createFromBuffer(
    filePath: string,
    fileContent: Buffer
  ): Promise<File> {
    await mkdirp(dirname(filePath));
    const file = new this(filePath);
    file.unreadUpdates = false;
    await file.writeFromBuffer(fileContent);
    return file;
  }

  async readAsBuffer(): Promise<Buffer> {
    await this.fetchFromDisk();
    return this.cache;
  }

  async writeFromBuffer(fileContent: Buffer): Promise<void> {
    this.cache = fileContent;
    await this.flushToDisk();
  }

  async writeFromStream(fileStream: Readable): Promise<void> {
    const file = createWriteStream(this.filePath);
    await new Promise((resolve, reject) => {
      file.on("error", reject);
      file.on("end", resolve);
      fileStream.on("error", reject);
      fileStream.pipe(file);
    });
    this.unreadUpdates = true;
  }

  async needsFetch(): Promise<boolean> {
    return this.unreadUpdates;
  }

  async needsFlush(): Promise<boolean> {
    return this.unwrittenChanges;
  }

  async fetchFromDisk(): Promise<void> {
    if (!this.needsFetch()) {
      return;
    }
    this.cache = await readFile(this.filePath);
    this.unreadUpdates = false;
    this.unwrittenChanges = false;
  }

  async flushToDisk(): Promise<void> {
    if (!this.needsFlush()) {
      return;
    }
    await writeFile(this.filePath, this.cache);
    this.unwrittenChanges = false;
    this.unreadUpdates = false;
  }

  async delete(): Promise<void> {
    await remove(this.filePath);
  }
}
