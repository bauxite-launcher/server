import fs from 'jest-plugin-fs';
import { gzip as gzipAsync } from 'zlib';
import { promisify } from 'util';
import LogFile from '../LogFile';

const gzip = promisify(gzipAsync);

const rawLog = `
[17:16:52] [Server thread/INFO]: Loading properties
[17:16:52] [Server thread/WARN]: server.properties does not exist
[17:16:52] [Server thread/INFO]: Generating new properties file
[17:16:52] [Server thread/INFO]: Default game type: SURVIVAL
Example to test multi-line entries
Which might happen with errors %TEST%
[17:16:52] [Server thread/INFO]: Generating keypair
[17:16:52] [Server thread/INFO]: Starting Minecraft server on *:25565
[17:16:52] [Server thread/INFO]: Using epoll channel type
[17:16:52] [Server thread/INFO]: Preparing level "world"
[17:16:52] [Server thread/INFO]: Found new data pack vanilla, loading it automatically
[17:16:52] [Server thread/INFO]: Reloading ResourceManager: Default
[17:16:53] [Server thread/INFO]: Loaded 524 recipes
[17:16:54] [Server thread/INFO]: Loaded 571 advancements
[17:16:58] [Server thread/INFO]: Preparing start region for dimension minecraft:overworld`;

jest.mock('fs', () => require('jest-plugin-fs/mock'));

describe('LogFile', () => {
  it('should be a function', () => {
    expect(LogFile).toBeInstanceOf(Function);
  });

  describe('static methods', () => {
    describe('parse', () => {
      let result;
      beforeEach(() => {
        result = LogFile.parse(rawLog);
      });

      it('should split up a file into an array of log entries', () => {
        expect(result).toBeInstanceOf(Array);
        result.forEach(item => expect(item).toBeInstanceOf(Object));
      });

      it('should handle multiline entries', () => {
        expect(result[3].text).toContain('%TEST%');
        expect(result[5].text).not.toContain('%TEST%');
      });
    });

    describe('parseItem', () => {
      let parsedLines;
      beforeEach(() => {
        parsedLines = LogFile.parse(rawLog);
      });

      it('should convert each line to an object', () => {
        parsedLines.forEach(entry => expect(entry).toBeInstanceOf(Object));
      });

      it('should output each time as a string', () => {
        parsedLines.forEach((entry) => {
          expect(entry).toHaveProperty('time');
          expect(entry.time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        });
      });

      it('should output each category set as an array of strings', () => {
        parsedLines.forEach((entry) => {
          expect(entry).toHaveProperty('category');
          expect(entry.category).toBeInstanceOf(Array);
          entry.category.forEach((cat) => {
            expect(typeof cat).toBe('string');
            expect(cat.length).toBeGreaterThan(0);
            expect(cat).not.toContain('/');
          });
        });
      });

      it('should set the log level', () => {
        parsedLines.forEach((entry) => {
          expect(entry).toHaveProperty('logLevel');
          expect(entry.logLevel).toBeDefined();
        });
      });
    });
  });

  describe('class methods', () => {
    let instance;
    afterEach(() => fs.restore());

    describe('with uncompressed logfile', () => {
      beforeEach(async () => {
        fs.mock({
          './logs/latest.log': rawLog,
        });
        instance = new LogFile('/logs/latest.log');
      });

      it('should automatically set logfile flag to false', () => {
        expect(instance).toHaveProperty('compressed', false);
      });

      describe('read', () => {
        it('should return an array of objects', async () => {
          const result = await instance.read();
          expect(result).toBeInstanceOf(Array);
          result.forEach(item => expect(item).toBeInstanceOf(Object));
        });
      });
    });

    describe('with compressed logfile', () => {
      beforeEach(async () => {
        fs.mock(
          {
            './2018-01-01-1.log.gz': (await gzip(rawLog)).toString('utf8'),
          },
          'logs',
        );
        instance = new LogFile('./logs/latest.log');
      });

      it('should automatically set logfile flag to false', () => {
        expect(instance).toHaveProperty('compressed', false);
      });
    });
  });
});
