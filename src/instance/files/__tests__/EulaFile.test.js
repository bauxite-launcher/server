import fs from 'jest-plugin-fs';
import EulaFile from '../EulaFile';

jest.mock('fs', () => require('jest-plugin-fs/mock'));

const mockFilePath = '/eula.txt';
const mockEulaTrue = `${EulaFile.header()}\neula=true`;
const existingFilesTrue = { [mockFilePath]: mockEulaTrue.toString() };

describe('EulaFile', () => {
  afterEach(() => fs.restore());

  it('should be a function', () => {
    expect(EulaFile).toBeInstanceOf(Function);
  });

  describe('when not existing on disk', () => {
    beforeEach(() => fs.mock());

    describe('when constructed', () => {
      it('should not throw an error', () => {
        expect(() => new EulaFile(mockFilePath)).not.toThrowError();
      });

      it('should return an instance of EulaFile', () => {
        expect(new EulaFile(mockFilePath)).toBeInstanceOf(EulaFile);
      });
    });

    describe('when read', () => {
      let eulaFile;
      beforeEach(() => {
        eulaFile = new EulaFile(mockFilePath);
      });
      it('should return null', async () => {
        await expect(eulaFile.read()).resolves.toBe(false);
      });
    });

    describe('when written with a value', () => {
      let eulaFile;
      beforeEach(() => {
        eulaFile = new EulaFile(mockFilePath);
      });
      it('should not error', async () => {
        await expect(eulaFile.write(false)).resolves.toBeUndefined();
      });

      it('should write to disk', async () => {
        await eulaFile.write(false);
        await expect(eulaFile.read()).resolves.toBe(false);
      });
    });

    describe('when written without a value', () => {
      let eulaFile;
      beforeEach(() => {
        eulaFile = new EulaFile(mockFilePath);
      });
      it('should error', async () => {
        await expect(eulaFile.write()).rejects.toBeInstanceOf(Error);
      });
    });
  });

  describe('when existing on disk', () => {
    beforeEach(() => fs.mock(existingFilesTrue));

    describe('when constructed', () => {
      it('should not throw an error', () => {
        expect(() => new EulaFile(mockFilePath)).not.toThrowError();
      });

      it('should return an instance of EulaFile', () => {
        expect(new EulaFile(mockFilePath)).toBeInstanceOf(EulaFile);
      });
    });

    describe('when read', () => {
      let eulaFile;
      beforeEach(() => {
        eulaFile = new EulaFile(mockFilePath);
      });
      it('should return the processId', async () => {
        await expect(eulaFile.read()).resolves.toBe(true);
      });
    });

    describe('when written with a value', () => {
      let eulaFile;
      beforeEach(() => {
        eulaFile = new EulaFile(mockFilePath);
      });
      it('should not throw an error', async () => {
        await expect(eulaFile.write(false)).resolves.toBeUndefined();
      });

      it('should write to disk', async () => {
        await eulaFile.write(false);
        await expect(eulaFile.read()).resolves.toBe(false);
      });
    });
  });
});
