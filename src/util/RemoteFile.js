// @flow
import fetch, { type FetchOptions, type FetchResult } from "node-fetch";
import { type Readable } from "stream";
import { File, type IFile } from "./File";

class RemoteFile<T: Object | Array<Object>> {
  url: string;
  cache: ?FetchResult<T>;
  fetchOptions: ?FetchOptions;

  constructor(url: string, fetchOptions?: FetchOptions) {
    this.url = url;
    if (fetchOptions) {
      this.fetchOptions = fetchOptions;
    }
  }

  clearCache(): void {
    delete this.cache;
  }

  async fetch(): Promise<FetchResult<T>> {
    if (!this.cache) {
      this.cache = await fetch(this.url, this.fetchOptions);
    }
    return this.cache;
  }

  async readAsStream(): Promise<Readable> {
    const res = await this.fetch();
    return res.body;
  }

  async readAsBuffer(): Promise<Buffer> {
    const res = await this.fetch();
    return res.buffer();
  }

  async readAsString(): Promise<string> {
    const res = await this.fetch();
    return res.text();
  }

  async readAsObject(): Promise<T> {
    const res = await this.fetch();
    return res.json();
  }

  async downloadToFile(
    filePath: string,
    FileClass: Class<File> = File
  ): Promise<IFile> {
    const readStream = await this.readAsStream();
    return File.createFromStream(filePath, readStream);
  }
}

export default RemoteFile;
