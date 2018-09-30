// @flow
import fetch, { type FetchOptions } from "node-fetch";
import { type Readable } from "stream";
import TextFile, { ReadableFile } from "./TextFile";

export function parseHeaderValue(value: string, keyToMatch: string): ?string {
  const parts = value.split(/;\s*/g).map(part => part.split(/=/g));
  const matchedPair = parts.find(([key, value]) => key === keyToMatch && value);
  if (!matchedPair) return null;
  const [, matchedValue] = matchedPair;
  return matchedValue && matchedValue.replace(/(^['"]|['"]$)/g, "");
}

class RemoteTextFile<T> implements ReadableFile<T> {
  +url: string;
  +fetchOptions: ?FetchOptions;
  suggestedFilename: ?string;
  suggestedEncoding: ?string;
  expectedLength: ?number;

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

  async fetch() {
    const response = await fetch(this.url, this.fetchOptions);
    if (!response.ok) {
      throw new Error(
        `While fetching ${this.url}, an HTTP error (${response.status}: ${
          response.statusText
        }) was returned`
      );
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      this.expectedLength = parseInt(contentLength, 10);
    }

    const contentType = response.headers.get("content-type");
    if (contentType) {
      const suggestedEncoding = parseHeaderValue(contentType, "charset");
      if (suggestedEncoding) {
        this.suggestedEncoding = suggestedEncoding.toLowerCase();
      }
    }

    const contentDisposition = response.headers.get("content-disposition");
    if (contentDisposition) {
      const suggestedFilename = parseHeaderValue(
        contentDisposition,
        "filename"
      );
      if (suggestedFilename) {
        this.suggestedFilename = suggestedFilename;
      }
    }
    return response;
  }

  async readRaw(): Promise<string> {
    const response = await this.fetch();
    return response.text();
  }

  async readStream(): Promise<Readable> {
    const response = await this.fetch();
    return response.body;
  }
}

export default RemoteTextFile;
