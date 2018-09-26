// @flow
import fetch, { type FetchOptions } from "node-fetch";
import TextFile, { ReadableFile } from "./TextFile";

class RemoteTextFile<T> implements ReadableFile<T> {
  +url: string;
  +fetchOptions: ?FetchOptions;

  static +parse: (rawValue: string) => Promise<T> | T;

  constructor(url: string, fetchOptions?: FetchOptions) {
    if (!url) {
      throw new Error("RemoteFile requires a url argument");
    }
    this.url = url;
    if (fetchOptions) {
      this.fetchOptions = fetchOptions;
    }
  }

  read = TextFile.prototype.read;

  async readRaw(): Promise<string> {
    const response = await fetch(this.url, this.fetchOptions);
    if (!response.ok) {
      throw new Error(
        `While fetching ${this.url}, an HTTP error (${response.status}: ${
          response.statusText
        }) was returned`
      );
    }
    return response.text();
  }
}

export default RemoteTextFile;
