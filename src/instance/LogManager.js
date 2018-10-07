import { resolve as resolvePath } from 'path';
import { readdir } from 'fs-extra';
import formatDate from 'date-fns/format';
import LogFile from './files/LogFile';

class LogManager {
  directory: string;

  cache: ?Array<LogFile>;

  constructor(directory: string) {
    this.directory = directory;
  }

  async listAll(bypassCache: boolean = false): Promise<Array<LogFile>> {
    if (bypassCache || !this.cache) {
      const allFileNames = await readdir(this.directory);
      const logFileNames = allFileNames.filter(
        name => name.endsWith('.log') || name.endsWith('.log.gz'),
      );
      this.cache = logFileNames.map((name) => {
        const path = resolvePath(this.directory, name);
        return new LogFile(path, path.endsWith('.gz'));
      });
    }
    return this.cache;
  }

  async getLatest(bypassCache: boolean = false): Promise<?LogFile> {
    const all = await this.listAll(bypassCache);
    return all.find(logFile => logFile.name === 'latest.log');
  }

  async getByDate(
    date: Date,
    bypassCache: boolean = false,
  ): Promise<Array<LogFile>> {
    const all = await this.listAll(bypassCache);
    const targetName = `${formatDate(date, 'YYYY-MM-DD')}`;
    return all.filter(logFile => logFile.name.startsWith(targetName));
  }
}

export default LogManager;
