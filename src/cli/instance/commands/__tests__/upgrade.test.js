import { upgradeCommand } from '../upgrade';
import MinecraftInstance from '../../../../instance/Instance';
import ServerProcess from '../../../../instance/Process';
import SettingsFile from '../../../../instance/files/SettingsFile';
import Releases from '../../../../versions/MinecraftReleaseListFile';

jest.mock('../../../../instance/Instance');
jest.mock('../../../../instance/Process');
jest.mock('../../../../instance/files/SettingsFile');
jest.mock('../../../../versions/MinecraftReleaseListFile');

const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

// TODO: Test render method

describe('upgrade command', () => {
  let instance;
  beforeEach(() => {
    global.console.log = jest.fn();
    global.console.warn = jest.fn();
    MinecraftInstance.mockClear();
    SettingsFile.mockClear();
    ServerProcess.mockClear();
    instance = new MinecraftInstance();
    instance.directory = '/';
    instance.settings = new SettingsFile();
    instance.process = new ServerProcess();
  });

  afterEach(() => {
    global.console.log = originalConsoleLog;
    global.console.warn = originalConsoleWarn;
  });

  it('should be an object', () => {
    expect(upgradeCommand).toBeInstanceOf(Object);
  });

  it('should have a name and description', () => {
    expect(upgradeCommand).toHaveProperty('command', 'upgrade');
    expect(upgradeCommand).toHaveProperty('description');
  });

  it('should have a setup method', () => {
    expect(upgradeCommand.setup).toBeInstanceOf(Function);
  });

  it('should have a render method', () => {
    expect(upgradeCommand.render).toBeInstanceOf(Function);
  });

  describe('setup method', () => {
    describe('when instance is already upgradeed', () => {
      beforeEach(() => {
        instance.isInstalled.mockImplementation(() => Promise.resolve(true));
      });

      it('should resolve to an error', async () => {
        await expect(upgradeCommand.setup({}, instance)).rejects.toBeInstanceOf(
          Error,
        );
      });
    });

    describe('when instance is not installed', () => {
      beforeEach(() => {
        instance.isInstalled.mockImplementation(() => Promise.resolve(false));
        Releases.latest.mockImplementation(() => Promise.resolve({ id: '1.13.1' }));
      });

      it('should throw an error', async () => {
        await expect(upgradeCommand.setup({}, instance)).rejects.toBeInstanceOf(
          Error,
        );
      });
    });

    describe('when instance is installed', () => {
      beforeEach(() => {
        instance.isInstalled.mockImplementation(() => Promise.resolve(true));
        instance.settings.read.mockImplementation(() => Promise.resolve({ minecraftVersion: '1.13.1' }));
      });

      describe('when no version is specified', () => {
        it('should throw an error', async () => {
          await expect(
            upgradeCommand.setup({}, instance),
          ).rejects.toBeInstanceOf(Error);
        });
      });

      describe('when a version is specified', () => {
        describe('which is the same as the current version', () => {
          it('should throw an error', async () => {
            await expect(
              upgradeCommand.setup({ version: '1.13.1' }, instance),
            ).rejects.toBeInstanceOf(Error);
          });
        });

        describe('which is a different version', () => {
          let result;
          beforeEach(async () => {
            instance.settings.read
              .mockImplementationOnce(() => Promise.resolve({ minecraftVersion: '1.13.1' }))
              .mockImplementationOnce(() => Promise.resolve({ minecraftVersion: '1.14' }));
            result = await upgradeCommand.setup(
              { minecraftVersion: '1.14' },
              instance,
            );
          });
          it("should call the instance's upgrade method", () => {
            expect(instance.install.mock.calls[0][0]).toBe('1.14');
            expect(instance.install.mock.calls[0][2]).toBe(true);
          });

          it('should return a valid result', () => {
            expect(result).toMatchObject({
              directory: '/',
              newVersion: '1.14',
              oldVersion: '1.13.1',
            });
          });
        });
      });
    });
  });
});
