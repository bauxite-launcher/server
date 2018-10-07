// @flow
import JsonCollectionFile from '../../util/JsonCollectionFile';

export type RawLogEntry = string;

export type LogEntry = {
  time: string,
  category: Array<string>,
  logLevel: 'WARN' | 'ERROR' | 'INFO' | ?string,
  text: string,
};

export function parseLogEntry(symbols: Array<string>): LogEntry {
  let bracketsDeep = 0;
  let bracketBuffer = [];
  const bracketContents = [];
  const bodyBuffer = [];
  symbols.forEach((symbol) => {
    switch (symbol.trim()) {
      case '[':
        bracketsDeep += 1;
        return;
      case '] [':
        bracketContents.push(bracketBuffer.join(''));
        bracketBuffer = [];
        return;
      case ']':
      case ']:':
        bracketsDeep -= 1;
        if (!bracketsDeep) {
          bracketContents.push(bracketBuffer.join(''));
          bracketBuffer = [];
        }
        return;
      default:
        if (bracketsDeep) {
          bracketBuffer.push(symbol);
        } else {
          bodyBuffer.push(symbol);
        }
        break;
    }
  });
  const [time, baseCategory, ...categories] = bracketContents;

  let category = baseCategory;
  let logLevel;
  if (baseCategory && baseCategory.includes('/')) {
    [category, logLevel] = baseCategory.split('/');
  }
  const text = bodyBuffer.join('');
  return {
    time,
    text,
    category: [category, ...categories],
    logLevel,
  };
}

class LogFile extends JsonCollectionFile<LogEntry, RawLogEntry> {
  static parse(rawFile: string): Array<RawLogEntry> {
    return rawFile
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
  }

  static parseItem(rawEntry: RawLogEntry): LogEntry {
    const parts = rawEntry.split(/\b/g);
    return parseLogEntry(parts);
  }

  async writeRaw() {
    throw new Error(`LogFile is not writable (${this.path})`);
  }
}

export default LogFile;
