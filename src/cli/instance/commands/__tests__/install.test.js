import { installCommand } from '../install';
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

describe('install command', () => {
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
    expect(installCommand).toBeInstanceOf(Object);
  });

  it('should have a name and description', () => {
    expect(installCommand).toHaveProperty('command', 'install');
    expect(installCommand).toHaveProperty('description');
  });

  it('should have a setup method', () => {
    expect(installCommand.setup).toBeInstanceOf(Function);
  });

  it('should have a render method', () => {
    expect(installCommand.render).toBeInstanceOf(Function);
  });

  describe('setup method', () => {
    describe('when instance is already installed', () => {
      beforeEach(() => {
        instance.isInstalled.mockImplementation(() => Promise.resolve(true));
      });

      it('should resolve to an error', async () => {
        await expect(installCommand.setup({}, instance)).rejects.toBeInstanceOf(
          Error,
        );
      });
    });

    describe('when instance is not installed', () => {
      let result;
      beforeEach(() => {
        instance.isInstalled.mockImplementation(() => Promise.resolve(false));
        Releases.latest.mockImplementation(() => Promise.resolve({ id: '1.13.1' }));
      });

      describe('when no version is specified', () => {
        beforeEach(async () => {
          instance.settings.read.mockImplementation(() => Promise.resolve({ minecraftVersion: '1.13.1' }));
          result = await installCommand.setup({}, instance);
        });

        it("should call the instance's install method", () => {
          expect(instance.install.mock.calls[0][0]).toBe('1.13.1');
        });

        it('should return a valid result', () => {
          expect(result).toMatchObject({
            directory: '/',
            minecraftVersion: '1.13.1',
          });
        });
      });

      describe('when a version is specified', () => {
        beforeEach(async () => {
          instance.settings.read.mockImplementation(() => Promise.resolve({ minecraftVersion: '1.12.2' }));
          result = await installCommand.setup(
            { minecraftVersion: '1.12.2' },
            instance,
          );
        });

        it("should call the instance's install method", () => {
          expect(instance.install.mock.calls[0][0]).toBe('1.12.2');
        });

        it('should return a valid result', () => {
          expect(result).toMatchObject({
            directory: '/',
            minecraftVersion: '1.12.2',
          });
        });
      });
    });
  });
});
