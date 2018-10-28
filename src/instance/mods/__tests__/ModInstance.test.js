import fs from 'jest-plugin-fs';
import ModInstance from '../ModInstance';
import MinecraftInstance from '../../Instance';
import TextFile from '../../../util/file/TextFile';

jest.mock('../../Instance');
jest.mock('fs', () => require('jest-plugin-fs/mock'));

describe('ModInstance', () => {
  const mockModContent = '⛏️⛏️⛏️';
  const mockManifest = {
    path: 'mod.jar',
    from: { type: 'local' },
  };
  let mockMinecraftInstance;

  beforeEach(() => {
    mockMinecraftInstance = new MinecraftInstance();
    mockMinecraftInstance.directory = '/';
    mockMinecraftInstance.path.mockImplementation(
      (...bits) => `/${bits.join('/')}`,
    );
    fs.mock();
  });

  afterEach(() => {
    fs.restore();
  });

  describe('constructor', () => {
    it('should be a function', () => {
      expect(ModInstance).toBeInstanceOf(Function);
    });

    it('should not throw an error', () => {
      expect(
        () => new ModInstance(mockMinecraftInstance, mockManifest),
      ).not.toThrowError();
    });
  });

  describe('static methods', () => {
    describe('fromLocalFile', () => {
      let localFile;
      beforeEach(() => {
        localFile = new TextFile('/mods/mod.jar');
      });
      it('should be a function', () => {
        expect(ModInstance.fromLocalFile).toBeInstanceOf(Function);
      });

      describe('if the file is not in the right place', () => {
        beforeEach(() => {
          localFile = new TextFile('/otherFile.jar');
          fs.mock({ '/otherFile.jar': mockModContent });
        });

        it('should return a new ModInstance', async () => {
          await expect(
            ModInstance.fromLocalFile(mockMinecraftInstance, localFile),
          ).resolves.toBeInstanceOf(ModInstance);
        });

        it('should copy the file first', async () => {
          await ModInstance.fromLocalFile(mockMinecraftInstance, localFile);
          expect(fs.files()['/mods/otherFile.jar']).toBe(mockModContent);
        });
      });

      describe('if the file is already in the right place', () => {
        beforeEach(() => {
          localFile = new TextFile('/mods/mod.jar');
          fs.mock({ '/mods/mod.jar': mockModContent });
        });

        it('should return a new ModInstance', async () => {
          await expect(
            ModInstance.fromLocalFile(mockMinecraftInstance, localFile),
          ).resolves.toBeInstanceOf(ModInstance);
        });

        it('should not affect the existing file', async () => {
          await ModInstance.fromLocalFile(mockMinecraftInstance, localFile);
          expect(fs.files()['/mods/mod.jar']).toBe(mockModContent);
        });
      });
    });

    describe('fromRemoteFile', () => {
      it('should be a function', () => {
        expect(ModInstance.fromRemoteFile).toBeInstanceOf(Function);
      });

      // TODO: Nock out some tests
      xit('should return a new ModInstance', () => {});
      xit('should fetch the remote file', () => {});
      xit('should install to the right location', () => {});
    });
  });

  describe('class methods', () => {
    let instance;
    beforeEach(() => {
      instance = new ModInstance(mockMinecraftInstance, mockManifest);
    });

    describe('isInstalled', () => {
      it('should be a function', () => {
        expect(instance.isInstalled).toBeInstanceOf(Function);
      });

      describe('when the file exists', () => {
        beforeEach(() => {
          fs.mock({ '/mods/mod.jar': mockModContent });
        });
        it('should return true', async () => {
          await expect(instance.isInstalled()).resolves.toBe(true);
        });
      });

      describe('when the file does not exist', () => {
        it('should return false', async () => {
          await expect(instance.isInstalled()).resolves.toBe(false);
        });
      });
    });

    describe('remove', () => {
      it('should be a function', () => {
        expect(instance.remove).toBeInstanceOf(Function);
      });

      describe('when the file exists', () => {
        beforeEach(() => {
          fs.mock({ '/mods/mod.jar': mockModContent });
        });
        it('should resolve', async () => {
          await expect(instance.remove()).resolves.toBeUndefined();
        });
        it('should delete the file', async () => {
          await instance.remove();
          expect(fs.files()['/mods/mod.jar']).toBeUndefined();
        });
      });

      describe('when the file does not exist', () => {
        it('should resolve', async () => {
          await expect(instance.remove()).resolves.toBeUndefined();
        });
      });
    });
  });
});
