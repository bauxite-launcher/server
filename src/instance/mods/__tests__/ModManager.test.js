import fs from 'jest-plugin-fs';
import ModManager from '../ModManager';
import MinecraftInstance from '../../Instance';
import ModInstance from '../ModInstance';

jest.mock('../../Instance');
jest.mock('fs', () => require('jest-plugin-fs/mock'));

describe('ModManager', () => {
  const fakeModManifest = [{ path: 'test.jar' }];
  const baseFs = { '/mods/.keep': '' };

  it('should be a function', () => {
    expect(ModManager).toBeInstanceOf(Function);
  });

  beforeEach(() => {
    fs.mock(baseFs);
  });

  afterEach(() => {
    fs.restore();
  });

  describe('instance methods', () => {
    let mockMinecraftInstance;
    let modManager;

    beforeEach(() => {
      mockMinecraftInstance = new MinecraftInstance();
      mockMinecraftInstance.directory = '/';
      mockMinecraftInstance.path.mockImplementation(
        (...bits) => `/${bits.join('/')}`,
      );
      modManager = new ModManager(mockMinecraftInstance);
    });

    describe('listMods', () => {
      it('should be a function', () => {
        expect(modManager.listMods).toBeInstanceOf(Function);
      });

      describe('when there are no mods', () => {
        it('should return an empty array', async () => {
          await expect(modManager.listMods()).resolves.toEqual([]);
        });
      });

      describe('when there are some mods', () => {
        beforeEach(() => {
          fs.mock({ ...baseFs, '/mods.json': JSON.stringify(fakeModManifest) });
        });

        it('should return an array of mods', async () => {
          const mods = await modManager.listMods();
          expect(mods).toBeInstanceOf(Array);
          expect(mods).toHaveLength(fakeModManifest.length);
          mods.forEach(mod => expect(mod).toBeInstanceOf(ModInstance));
        });
      });
    });

    describe('addMod', () => {
      it('should be a function', () => {
        expect(modManager.addMod).toBeInstanceOf(Function);
      });

      describe('when the mod is not installed', () => {
        xit('should throw an error', () => {});
      });

      describe('when the mod is already installed', () => {
        xit('should resolve silently', () => {});
      });
    });

    describe('removeMod', () => {
      it('should be a function', () => {
        expect(modManager.removeMod).toBeInstanceOf(Function);
      });

      describe('when the mod is not installed', () => {
        xit('should resolve silently', () => {});
      });

      describe('when the mod is already installed', () => {
        xit('should throw an error', () => {});
      });
    });

    describe('areAllModsInstalled', () => {
      it('should be a function', () => {
        expect(modManager.areAllModsInstalled).toBeInstanceOf(Function);
      });

      describe('when no mods are installed (and none listed)', () => {
        xit('should return true', () => {});
      });

      describe('when some mods are installed', () => {
        xit('should return false', () => {});
      });

      describe('when all mods are installed', () => {
        xit('should return true', () => {});
      });
    });
  });
});
