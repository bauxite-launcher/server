// @flow
import { gunzip as gunzipAsync } from 'zlib';
import { promisify } from 'util';
import { readFile } from 'fs-extra';
import { Tail } from 'tail';
import JsonCollectionFile from '../../util/file/JsonCollectionFile';

const gunzip: (Buffer | string) => string = promisify(gunzipAsync);

export type RawLogEntry = string;

export type LogEntry = {
  time: string,
  logLevel: 'WARN' | 'ERROR' | 'INFO' | ?string,
  thread: string,
  category: Array<string>,
  text: string,
};

export function parseLogEntry(symbols: Array<string>): LogEntry {
  let bracketsDeep = 0;
  let bracketBuffer = [];
  let hadBrackets = false;
  const bracketContents = [];
  const bodyBuffer = [];
  symbols.forEach((symbol) => {
    /* eslint-disable no-fallthrough */
    switch (symbol.trim()) {
      case '[':
        if (!hadBrackets) {
          hadBrackets = true;
          bracketsDeep += 1;
          return;
        }
      case '] [':
      case ']: [':
        if (!(hadBrackets && !bracketsDeep)) {
          bracketContents.push(bracketBuffer.join(''));
          bracketBuffer = [];
          return;
        }
      case ']':
      case ']:':
        if (!(hadBrackets && !bracketsDeep)) {
          bracketsDeep -= 1;
          if (!bracketsDeep) {
            bracketContents.push(bracketBuffer.join(''));
            bracketBuffer = [];
          }
          return;
        }
      default:
        if (bracketsDeep) {
          bracketBuffer.push(symbol);
        } else {
          bodyBuffer.push(symbol);
        }
        break;
    }
    /* eslint-enable no-fallthrough */
  });
  const [time, baseCategory, ...categories] = bracketContents;
  let thread = baseCategory;
  let logLevel;
  if (baseCategory && baseCategory.includes('/')) {
    [thread, logLevel] = baseCategory.split('/');
  }
  const text = bodyBuffer.join('');
  const deduplicatedCategories = categories.reduce((acc, cat) => {
    if (acc.includes(cat)) {
      return acc;
    }
    return acc.concat([cat]);
  }, []);
  return {
    time,
    text,
    thread,
    category: deduplicatedCategories,
    logLevel,
  };
}

class LogFile extends JsonCollectionFile<LogEntry, RawLogEntry> {
  compressed: boolean;

  tailFileCache: ?Tail;

  tailFile: Tail;

  static parse(rawFile: string): Array<LogEntry> {
    const rawCollection: Array<RawLogEntry> = rawFile
      .split(/\r?\n/g)
      .map(line => line.trim())
      .filter(Boolean)
      .reduce((acc, line) => {
        if (line.startsWith('[')) {
          acc.push(line);
        } else {
          const lastIndex = acc.length - 1;
          acc[lastIndex] += `\n${line}`;
        }
        return acc;
      }, []);
    return rawCollection.map(item => this.parseItem(item));
  }

  static parseItem(rawEntry: RawLogEntry): LogEntry {
    const parts = rawEntry.split(/\b/g);
    return parseLogEntry(parts);
  }

  constructor(path: string, compressed?: boolean = path.endsWith('.gz')) {
    super(path, compressed ? null : 'utf8');
    this.compressed = compressed;
  }

  async writeRaw() {
    throw new Error(`LogFile is not writable (${this.path})`);
  }

  async readRaw() {
    if (!this.compressed) {
      return super.readRaw();
    }
    const uncompressed = await gunzip(await readFile(this.path));
    return uncompressed.toString();
  }

  async readLast(lines: number): Promise<Array<LogEntry>> {
    const all = await this.read();
    return all.slice(-lines);
  }

  get tailFile() {
    if (!this.tailFileCache) {
      this.tailFileCache = new Tail(this.path);
    }
    return this.tailFileCache;
  }

  // TODO: Unit tests (!)
  tail(
    lineCallback: LogEntry => void,
    errorCallback: Error => void,
  ): () => void {
    const parseAndCallback = line => lineCallback(this.constructor.parseItem(line));
    let lineBuffer = [];
    const handleLine = (line) => {
      if (line.startsWith('[')) {
        if (lineBuffer.length) {
          parseAndCallback(lineBuffer.join('\n'));
          lineBuffer = [];
        }
        parseAndCallback(line);
      } else {
        lineBuffer.push(line);
      }
    };

    return this.tailRaw(handleLine, errorCallback);
  }

  tailFileWatcherCount = 0;

  tailRaw(
    lineCallback: string => void,
    errorCallback: Error => void,
  ): () => void {
    this.tailFile.watch();
    this.tailFileWatcherCount += 1;
    this.tailFile.on('line', lineCallback).on('error', errorCallback);
    return () => {
      this.tailFileWatcherCount -= 1;
      if (!this.tailFileWatcherCount) {
        this.tailFile.unwatch();
      }
      this.tailFile.off('line', lineCallback).off('error', errorCallback);
    };
  }
}

export default LogFile;
