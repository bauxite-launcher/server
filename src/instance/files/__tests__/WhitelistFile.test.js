import fs from 'jest-plugin-fs';
import WhitelistFile from '../WhitelistFile';
import TextFile from '../../../util/TextFile';

jest.mock('fs', () => require('jest-plugin-fs/mock'));

describe('WhitelistFile', () => {
  const filePath = '/whitelist.json';
  const mockContent = [
    { uuid: '12345', name: 'jazzy' },
    { uuid: '54321', name: 'jeff' },
  ];
  const mockFiles = { [filePath]: JSON.stringify(mockContent) };
  const createInstance = () => new WhitelistFile(filePath);

  it('should be a function', () => {
    expect(WhitelistFile).toBeInstanceOf(Function);
  });

  describe('when instantiated', () => {
    it('should not error', () => {
      expect(createInstance).not.toThrowError();
    });

    it('should return an instance of WhitelistFile', () => {
      expect(createInstance()).toBeInstanceOf(WhitelistFile);
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

    describe('userIsWhitelisted', () => {
      it('should return true, where a user matches by uuid', async () => {
        await expect(instance.userIsWhitelisted('54321')).resolves.toBe(true);
      });
      it('should return true, where a user matches by name', async () => {
        await expect(instance.userIsWhitelisted('jazzy')).resolves.toBe(true);
      });
      it('should return false, where no user matches', async () => {
        await expect(instance.userIsWhitelisted('67890')).resolves.toBe(false);
      });
    });
  });
});
