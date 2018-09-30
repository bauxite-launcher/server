import fs from 'jest-plugin-fs';
import ProcessIdFile from '../ProcessIdFile';

jest.mock('fs', () => require('jest-plugin-fs/mock'));

const mockFilePath = '/instance.pid';
const mockProcessId = 12345;
const existingFiles = { [mockFilePath]: mockProcessId.toString() };

describe('ProcessIdFile', () => {
  afterEach(() => fs.restore());

  it('should be a function', () => {
    expect(ProcessIdFile).toBeInstanceOf(Function);
  });

  describe('when not existing on disk', () => {
    beforeEach(() => fs.mock());

    describe('when constructed', () => {
      it('should not throw an error', () => {
        expect(() => new ProcessIdFile(mockFilePath)).not.toThrowError();
      });

      it('should return an instance of ProcessIdFile', () => {
        expect(new ProcessIdFile(mockFilePath)).toBeInstanceOf(ProcessIdFile);
      });
    });

    describe('when read', () => {
      let processIdFile;
      beforeEach(() => {
        processIdFile = new ProcessIdFile(mockFilePath);
      });
      it('should return null', async () => {
        await expect(processIdFile.read()).resolves.toBe(null);
      });
    });

    describe('when written with a value', () => {
      let processIdFile;
      beforeEach(() => {
        processIdFile = new ProcessIdFile(mockFilePath);
      });
      it('should not error', async () => {
        await expect(processIdFile.write(mockProcessId)).resolves.toBeUndefined();
      });

      it('should write to disk', async () => {
        await processIdFile.write(mockProcessId);
        expect(fs.files()).toMatchObject(existingFiles);
      });
    });

    describe('when written without a value', () => {
      let processIdFile;
      beforeEach(() => {
        processIdFile = new ProcessIdFile(mockFilePath);
      });
      it('should not error', async () => {
        await expect(processIdFile.write()).resolves.toBeUndefined();
      });

      it('should not write to disk', async () => {
        await processIdFile.write();
        expect(fs.files()).toMatchObject({});
      });
    });
  });

  describe('when existing on disk', () => {
    beforeEach(() => fs.mock(existingFiles));

    describe('when constructed', () => {
      it('should not throw an error', () => {
        expect(() => new ProcessIdFile(mockFilePath)).not.toThrowError();
      });

      it('should return an instance of ProcessIdFile', () => {
        expect(new ProcessIdFile(mockFilePath)).toBeInstanceOf(ProcessIdFile);
      });
    });

    describe('when read', () => {
      let processIdFile;
      beforeEach(() => {
        processIdFile = new ProcessIdFile(mockFilePath);
      });
      it('should return the processId', async () => {
        await expect(processIdFile.read()).resolves.toBe(mockProcessId);
      });
    });

    describe('when written with a value', () => {
      let processIdFile;
      beforeEach(() => {
        processIdFile = new ProcessIdFile(mockFilePath);
      });
      it('should not throw an error', async () => {
        await expect(processIdFile.write(mockProcessId)).resolves.toBeUndefined();
      });

      it('should write to disk', async () => {
        await processIdFile.write(mockProcessId);
        expect(fs.files()).toMatchObject(existingFiles);
      });
    });

    describe('when written without a value', () => {
      let processIdFile;
      beforeEach(() => {
        processIdFile = new ProcessIdFile(mockFilePath);
      });
      it('should not throw an error', async () => {
        await expect(processIdFile.write()).resolves.toBeUndefined();
      });

      it('should delete from the disk', async () => {
        await processIdFile.write();
        expect(fs.files()).toMatchObject({});
      });
    });
  });
});
