import fs from 'jest-plugin-fs';
import { ZipFile } from 'yazl';
import ArchivedFile from '../ArchivedFile';

jest.mock('fs', () => require('jest-plugin-fs/mock'));

const mockArchivePath = '/path/to/archive.zip';
const mockInnerPath = 'file.json';
const mockFileContent = 'TESTING THE THING';

const createInstance = () => new ArchivedFile(mockArchivePath, mockInnerPath);

const writeMockArchive = async (archivePath, archiveFiles) => {
  const archive = new ZipFile();
  const filePipe = require('fs').createWriteStream(archivePath);
  const done = new Promise((resolve, reject) => filePipe.on('error', reject).on('close', resolve));
  archive.outputStream.pipe(filePipe);

  Object.entries(archiveFiles).forEach(([path, content]) => archive.addBuffer(Buffer.from(content), path));
  archive.end();
  await done;
};

describe('ArchivedFile', () => {
  beforeEach(() => fs.mock());
  afterEach(() => fs.restore());

  it('should be a function', () => {
    expect(ArchivedFile).toBeInstanceOf(Function);
  });

  describe('constructor', () => {
    describe('when called without a path', () => {
      it('should throw an error', () => {
        expect(() => new ArchivedFile()).toThrowError();
      });
    });

    describe('when called without an innerPath', () => {
      it('should throw an error', () => {
        expect(() => new ArchivedFile('/path/to/archive')).toThrowError();
      });
    });

    describe('when called with all required parameter', () => {
      it('should not throw an error', () => {
        expect(createInstance).not.toThrowError();
      });

      it('should return an instance of ArchivedFile', () => {
        expect(createInstance()).toBeInstanceOf(ArchivedFile);
      });
    });
  });

  describe('instance methods', () => {
    let instance;
    beforeEach(() => {
      instance = createInstance();
    });

    describe('writeRaw', () => {
      it('should throw an error', async () => {
        await expect(instance.writeRaw('blah')).rejects.toBeInstanceOf(Error);
      });
    });

    describe('readRaw', () => {
      beforeEach(() => {
        fs.mock({ '/path/to/.keep': '' });
      });

      describe('when the archive does not exist', () => {
        it('should throw an error', async () => {
          await expect(instance.readRaw()).rejects.toBeInstanceOf(Error);
        });
      });

      describe('when the archive exists, but does not contain the inner file', () => {
        beforeEach(async () => {
          await writeMockArchive(mockArchivePath, {});
        });

        it('should throw an error', async () => {
          await expect(instance.readRaw()).rejects.toBeInstanceOf(Error);
        });
      });

      describe('when the archive exists, and contains inner file', () => {
        beforeEach(async () => {
          await writeMockArchive(mockArchivePath, {
            [mockInnerPath]: mockFileContent,
          });
        });

        it('should return the raw file content', async () => {
          await expect(instance.readRaw()).resolves.toEqual(mockFileContent);
        });
      });
    });
  });
});
