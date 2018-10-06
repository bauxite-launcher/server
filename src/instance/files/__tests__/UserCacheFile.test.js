import fs from 'jest-plugin-fs';
import UserCacheFile from '../UserCacheFile';
import TextFile from '../../../util/TextFile';

jest.mock('fs', () => require('jest-plugin-fs/mock'));

describe('UserCacheFile', () => {
  const filePath = '/usercache.json';
  const mockContent = [
    { uuid: '12345', name: 'jazzy', expiresOn: '1970-01-02T00:00:00' },
    { uuid: '54321', name: 'jeff', expiresOn: '1970-01-05T00:00:00' },
  ];
  const mockFiles = { [filePath]: JSON.stringify(mockContent) };
  const createInstance = () => new UserCacheFile(filePath);

  it('should be a function', () => {
    expect(UserCacheFile).toBeInstanceOf(Function);
  });

  describe('when instantiated', () => {
    it('should not error', () => {
      expect(createInstance).not.toThrowError();
    });

    it('should return an instance of UserCacheFile', () => {
      expect(createInstance()).toBeInstanceOf(UserCacheFile);
    });

    it('should return an instance of TextFile', () => {
      expect(createInstance()).toBeInstanceOf(TextFile);
    });
  });

  describe('static methods', () => {
    describe('parseItem', () => {
      it('should be a function', () => {
        expect(UserCacheFile.parseItem).toBeInstanceOf(Function);
      });

      it('should convert dates in items', () => {
        const parsed = UserCacheFile.parseItem(mockContent[0]);
        expect(parsed).toHaveProperty('name', mockContent[0].name);
        expect(parsed).toHaveProperty('uuid', mockContent[0].uuid);
        expect(parsed).toHaveProperty('expiresOn', new Date(1970, 0, 2));
      });
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

    describe('write', () => {
      it('should throw an error', async () => {
        await expect(instance.write([])).rejects.toBeInstanceOf(Error);
      });
    });

    describe('findByUuid', () => {
      it('should return the matched user, where one matches', async () => {
        await expect(instance.findByUuid('54321')).resolves.toHaveProperty(
          'uuid',
          mockContent[1].uuid,
        );
      });
      it('should return undefined, where none matches', async () => {
        await expect(instance.findByUuid('67890')).resolves.toBeUndefined();
      });
    });

    describe('findByName', () => {
      it('should return the matched user, where one matches', async () => {
        await expect(instance.findByName('jazzy')).resolves.toHaveProperty(
          'uuid',
          mockContent[0].uuid,
        );
      });
      it('should return undefined, where none matches', async () => {
        await expect(instance.findByName('asdf')).resolves.toBeUndefined();
      });
    });
  });
});
