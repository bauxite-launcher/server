import decompress from 'decompress';
import TextFile from './TextFile';

class ArchivedTextFile<T> extends TextFile<T> {
  innerPath: string;

  constructor(path: string, innerPath: string, encoding?: string) {
    super(path, encoding);
    this.innerPath = innerPath;
  }

  async writeRaw() {
    throw new Error(
      `${this.innerPath} (within ${this.path}) is not a writable file`,
    );
  }

  async readRaw() {
    const [file] = await decompress(this.path, {
      filter: fileInArchive => fileInArchive.path === this.innerPath,
    });

    return file;
  }
}

export default ArchivedTextFile;
