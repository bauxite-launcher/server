import fs from 'jest-plugin-fs';
import OpsFile from '../OpsFile';
import TextFile from '../../../util/file/TextFile';

jest.mock('fs', () => require('jest-plugin-fs/mock'));

describe('OpsFile', () => {
  const filePath = '/ops.json';
  const mockContent = [
    { uuid: '12345', name: 'jazzy' },
    { uuid: '54321', name: 'jeff' },
  ];
  const mockFiles = { [filePath]: JSON.stringify(mockContent) };
  const createInstance = () => new OpsFile(filePath);

  it('should be a function', () => {
    expect(OpsFile).toBeInstanceOf(Function);
  });

  describe('when instantiated', () => {
    it('should not error', () => {
      expect(createInstance).not.toThrowError();
    });

    it('should return an instance of OpsFile', () => {
      expect(createInstance()).toBeInstanceOf(OpsFile);
    });

    it('should return an instance of TextFile', () => {
      expect(createInstance()).toBeInstanceOf(TextFile);
    });
  });

  describe('class methods', () => {
    let instance;
    beforeEach(() => {
      fs.mock(mockFiles);
      instance = createInstance();
    });

    afterEach(() => {
      fs.restore();
    });

    describe('findByUuid', () => {
      it('should return the matched user, where one matches', async () => {
        await expect(instance.findByUuid('54321')).resolves.toMatchObject(
          mockContent[1],
        );
      });
      it('should return undefined, where none matches', async () => {
        await expect(instance.findByUuid('67890')).resolves.toBeUndefined();
      });
    });

    describe('findByName', () => {
      it('should return the matched user, where one matches', async () => {
        await expect(instance.findByName('jazzy')).resolves.toMatchObject(
          mockContent[0],
        );
      });
      it('should return undefined, where none matches', async () => {
        await expect(instance.findByName('asdf')).resolves.toBeUndefined();
      });
    });
  });
});
