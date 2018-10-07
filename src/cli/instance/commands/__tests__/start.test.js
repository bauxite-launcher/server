import { startCommand } from '../start';
import MinecraftInstance from '../../../../instance/Instance';
import ServerProcess from '../../../../instance/Process';
import SettingsFile from '../../../../instance/files/SettingsFile';

jest.mock('../../../../instance/Instance');
jest.mock('../../../../instance/Process');
jest.mock('../../../../instance/files/SettingsFile');

const originalConsoleLog = console.log;

// TODO: Test render method

describe('start command', () => {
  let instance;
  beforeEach(() => {
    global.console.log = jest.fn();
    MinecraftInstance.mockClear();
    instance = new MinecraftInstance();
    instance.directory = '/';
    instance.settings = new SettingsFile();
    instance.process = new ServerProcess();
  });

  afterEach(() => {
    global.console.log = originalConsoleLog;
  });

  it('should be an object', () => {
    expect(startCommand).toBeInstanceOf(Object);
  });

  it('should have a name and description', () => {
    expect(startCommand).toHaveProperty('command', 'start');
    expect(startCommand).toHaveProperty('description');
  });

  it('should have a setup method', () => {
    expect(startCommand.setup).toBeInstanceOf(Function);
  });

  it('should have a render method', () => {
    expect(startCommand.render).toBeInstanceOf(Function);
  });

  describe('setup method', () => {
    describe('when the instance is not installed', () => {
      beforeEach(() => {
        instance.isInstalled.mockImplementation(() => Promise.resolve(false));
      });

      it('should should throw an error', async () => {
        await expect(
          startCommand.setup({ directory: '/' }, instance),
        ).rejects.toBeInstanceOf(Error);
      });
    });

    describe('when the instance is installed', () => {
      beforeEach(() => {
        instance.isInstalled.mockImplementation(() => Promise.resolve(true));
      });

      describe('when the instance is already running', () => {
        beforeEach(async () => {
          instance.isRunning.mockImplementation(() => Promise.resolve(true));
        });

        it('should throw an error', async () => {
          await expect(startCommand.setup({}, instance)).rejects.toBeInstanceOf(
            Error,
          );
        });
      });

      describe('when the instance is not running', () => {
        let result;
        beforeEach(async () => {
          instance.isRunning.mockImplementation(() => Promise.resolve(false));
          instance.process.getProcessId.mockImplementation(() => Promise.resolve(12345));
          result = await startCommand.setup({}, instance);
        });

        it('should resolve to an object with a pid and started: true', () => {
          expect(result).toMatchObject({ pid: 12345, started: true });
        });

        it("should call the instance's launch method", () => {
          expect(instance.launch).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
