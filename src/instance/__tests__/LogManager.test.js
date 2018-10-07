import fs from 'jest-plugin-fs';
import { gzip as gzipAsync } from 'zlib';
import { promisify } from 'util';
import LogManager from '../LogManager';
import LogFile from '../files/LogFile';

const gzip = promisify(gzipAsync);

jest.mock('fs', () => require('jest-plugin-fs/mock'));
// jest.mock('../files/LogFile');

const mockLog = '[00:00:00] [Test/INFO]: Test Log';

describe('LogManager', () => {
  let instance;
  afterEach(() => {
    fs.restore();
  });
  it('should be a function', () => {
    expect(LogManager).toBeInstanceOf(Function);
  });

  describe('with no log files', () => {
    beforeEach(() => {
      fs.mock({ '/logs/.keep': '' });
      instance = new LogManager('/logs');
    });

    it('should be an instance of LogManager', () => {
      expect(instance).toBeInstanceOf(LogManager);
    });

    describe('listAll', () => {
      it('should resolve an empty array', async () => {
        await expect(instance.listAll()).resolves.toEqual([]);
      });
    });

    describe('getLatest', () => {
      it('should resolve to be undefined', async () => {
        await expect(instance.getLatest()).resolves.toBeUndefined();
      });
    });

    describe('getByDate', () => {
      it('should resolve to be an empty array', async () => {
        await expect(
          instance.getByDate(new Date('2018-01-01')),
        ).resolves.toEqual([]);
      });
    });
  });

  describe('with a latest log files', () => {
    beforeEach(() => {
      fs.mock({ '/logs/latest.log': mockLog });
      instance = new LogManager('/logs');
    });

    it('should be an instance of LogManager', () => {
      expect(instance).toBeInstanceOf(LogManager);
    });

    describe('listAll', () => {
      it('should resolve an empty array', async () => {
        const result = await instance.listAll();
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(LogFile);
      });
    });

    describe('getLatest', () => {
      it('should resolve to be undefined', async () => {
        await expect(instance.getLatest()).resolves.toBeInstanceOf(LogFile);
      });
    });

    describe('getByDate', () => {
      it('should resolve to be an empty array', async () => {
        await expect(instance.getByDate(new Date(2018, 0, 1))).resolves.toEqual(
          [],
        );
      });
    });
  });

  describe('with a latest and archived log files', () => {
    beforeEach(async () => {
      fs.mock({
        '/logs/latest.log': mockLog,
        '/logs/2018-01-01-1.log.gz': (await gzip(mockLog)).toString('utf8'),
      });
      instance = new LogManager('/logs');
    });

    it('should be an instance of LogManager', () => {
      expect(instance).toBeInstanceOf(LogManager);
    });

    describe('listAll', () => {
      it('should resolve an array of LogFiles', async () => {
        const result = await instance.listAll();
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(LogFile);
      });
    });

    describe('getLatest', () => {
      it('should resolve to be a LogFile', async () => {
        await expect(instance.getLatest()).resolves.toBeInstanceOf(LogFile);
      });
    });

    describe('getByDate', () => {
      it('should resolve to be array of 1 LogFile', async () => {
        const result = await instance.getByDate(new Date(2018, 0, 1));
        expect(result.length).toBe(1);
        expect(result[0]).toBeInstanceOf(LogFile);
        expect(result[0]).toHaveProperty('compressed', true);
      });
    });
  });
});
