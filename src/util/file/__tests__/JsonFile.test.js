import fs from 'jest-plugin-fs';
import JsonFile from '../JsonFile';

jest.mock('fs', () => require('jest-plugin-fs/mock'));

const mockContent = { key: 'hello there 💩' };
const mockFileContent = JSON.stringify(mockContent, null, 2);
const mockFilePath = '/file.json';
const existingFiles = { [mockFilePath]: mockFileContent };

describe('JsonFile', () => {
  afterEach(() => fs.restore());

  it('should be a function', () => {
    expect(JsonFile).toBeInstanceOf(Function);
  });

  describe('when not existing on disk', () => {
    beforeEach(() => fs.mock());

    describe('when constructed', () => {
      it('should not throw an error', () => {
        expect(() => new JsonFile(mockFilePath)).not.toThrowError();
      });

      it('should return an instance of JsonFile', () => {
        expect(new JsonFile(mockFilePath)).toBeInstanceOf(JsonFile);
      });
    });

    describe('when read', () => {
      let jsonFile;
      beforeEach(() => {
        jsonFile = new JsonFile(mockFilePath);
      });
      it('should throw an error', async () => {
        await expect(jsonFile.read()).rejects.toBeInstanceOf(Error);
      });
    });

    describe('when written with a value', () => {
      let jsonFile;
      beforeEach(() => {
        jsonFile = new JsonFile(mockFilePath);
      });
      it('should not error', async () => {
        await expect(jsonFile.write(mockContent)).resolves.toBeUndefined();
      });

      it('should write to disk', async () => {
        await jsonFile.write(mockContent);
        expect(fs.files()).toMatchObject(existingFiles);
      });
    });

    describe('when written without a value', () => {
      let jsonFile;
      beforeEach(() => {
        jsonFile = new JsonFile(mockFilePath);
      });
      it('should throw an error', async () => {
        await expect(jsonFile.write()).rejects.toBeInstanceOf(Error);
      });
    });
  });

  describe('when existing on disk', () => {
    beforeEach(() => fs.mock(existingFiles));

    describe('when constructed', () => {
      it('should not throw an error', () => {
        expect(() => new JsonFile(mockFilePath)).not.toThrowError();
      });

      it('should return an instance of JsonFile', () => {
        expect(new JsonFile(mockFilePath)).toBeInstanceOf(JsonFile);
      });
    });

    describe('when read', () => {
      let jsonFile;
      beforeEach(() => {
        jsonFile = new JsonFile(mockFilePath);
      });
      it('should return the processId', async () => {
        await expect(jsonFile.read()).resolves.toMatchObject(mockContent);
      });
    });

    describe('when written with a value', () => {
      let jsonFile;
      beforeEach(() => {
        jsonFile = new JsonFile(mockFilePath);
      });
      it('should not error', async () => {
        await expect(jsonFile.write(mockContent)).resolves.toBeUndefined();
      });

      it('should write to disk', async () => {
        await jsonFile.write(mockContent);
        expect(fs.files()).toMatchObject(existingFiles);
      });
    });

    describe('when written without a value', () => {
      let jsonFile;
      beforeEach(() => {
        jsonFile = new JsonFile(mockFilePath);
      });
      it('should throw an error', async () => {
        await expect(jsonFile.write()).rejects.toBeInstanceOf(Error);
      });
    });
  });
});
