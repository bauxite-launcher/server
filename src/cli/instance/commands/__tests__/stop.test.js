import { stopCommand } from '../stop';
import MinecraftInstance from '../../../../instance/Instance';
import ServerProcess from '../../../../instance/Process';
import SettingsFile from '../../../../instance/files/SettingsFile';

jest.mock('../../../../instance/Instance');
jest.mock('../../../../instance/Process');
jest.mock('../../../../instance/files/SettingsFile');

const originalConsoleLog = console.log;

// TODO: Test render method

describe('stop command', () => {
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
    expect(stopCommand).toBeInstanceOf(Object);
  });

  it('should have a name and description', () => {
    expect(stopCommand).toHaveProperty('command', 'stop');
    expect(stopCommand).toHaveProperty('description');
  });

  it('should have a setup method', () => {
    expect(stopCommand.setup).toBeInstanceOf(Function);
  });

  it('should have a render method', () => {
    expect(stopCommand.render).toBeInstanceOf(Function);
  });

  describe('setup method', () => {
    describe('when the instance is not installed', () => {
      beforeEach(() => {
        instance.isInstalled.mockImplementation(() => Promise.resolve(false));
      });

      it('should should throw an error', async () => {
        await expect(
          stopCommand.setup({ directory: '/' }, instance),
        ).rejects.toBeInstanceOf(Error);
      });
    });

    describe('when the instance is installed', () => {
      beforeEach(() => {
        instance.isInstalled.mockImplementation(() => Promise.resolve(true));
      });

      describe('when the instance is not running', () => {
        beforeEach(async () => {
          instance.isRunning.mockImplementation(() => Promise.resolve(false));
        });

        it('should throw an error', async () => {
          await expect(stopCommand.setup({}, instance)).rejects.toBeInstanceOf(
            Error,
          );
        });
      });

      describe('when the instance is running', () => {
        let result;
        beforeEach(async () => {
          instance.isRunning.mockImplementation(() => Promise.resolve(true));
          instance.process.getProcessId.mockImplementation(() => Promise.resolve(12345));
          result = await stopCommand.setup({}, instance);
        });

        it('should resolve to an object with a stopped: true', () => {
          expect(result).toMatchObject({ stopped: true });
        });

        it("should call the instance's kill method", () => {
          expect(instance.kill).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
