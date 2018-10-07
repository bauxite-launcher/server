import { statusCommand } from '../status';
import MinecraftInstance from '../../../../instance/Instance';
import ServerProcess from '../../../../instance/Process';
import SettingsFile from '../../../../instance/files/SettingsFile';

jest.mock('../../../../instance/Instance');
jest.mock('../../../../instance/Process');
jest.mock('../../../../instance/files/SettingsFile');

describe('status command', () => {
  let instance;
  beforeEach(() => {
    MinecraftInstance.mockClear();
    instance = new MinecraftInstance();
    instance.directory = '/';
    instance.settings = new SettingsFile();
    instance.process = new ServerProcess();
  });
  it('should be an object', () => {
    expect(statusCommand).toBeInstanceOf(Object);
  });

  it('should have a name and description', () => {
    expect(statusCommand).toHaveProperty('command', 'status');
    expect(statusCommand).toHaveProperty('description');
  });

  it('should have a setup method', () => {
    expect(statusCommand.setup).toBeInstanceOf(Function);
  });

  it('should have a render method', () => {
    expect(statusCommand.render).toBeInstanceOf(Function);
  });

  describe('setup method', () => {
    let result;
    describe('when the instance is not installed', () => {
      beforeEach(async () => {
        instance.isInstalled.mockImplementation(() => Promise.resolve(false));
        result = await statusCommand.setup({ directory: '/' }, instance);
      });

      it("should have called the instance's isInstalled method", () => {
        expect(instance.isInstalled).toHaveBeenCalledTimes(1);
      });

      it('should return an object with the directory and installed: false', () => {
        expect(result).toMatchObject({ directory: '/', installed: false });
      });
    });

    describe('when the instance is installed', () => {
      beforeEach(async () => {
        instance.isInstalled.mockImplementation(() => Promise.resolve(true));
        instance.settings.read.mockImplementation(() => Promise.resolve({ minecraftVersion: '1.13.1' }));
      });
      describe('when the instance is not running', () => {
        beforeEach(async () => {
          instance.isRunning.mockImplementation(() => Promise.resolve(false));
          result = await statusCommand.setup({ directory: '/' }, instance);
        });

        it("should have called the instance's isInstalled method", () => {
          expect(instance.isInstalled).toHaveBeenCalledTimes(1);
        });

        it("should have called the instance's isRunning method", () => {
          expect(instance.isRunning).toHaveBeenCalledTimes(1);
        });

        it('should have called the settings.read method', () => {
          expect(instance.settings.read).toHaveBeenCalledTimes(1);
        });

        it('should return an object with the directory installed: false, running: true', () => {
          expect(result).toMatchObject({
            directory: '/',
            installed: true,
            version: '1.13.1',
            running: false,
          });
        });
      });

      describe('when the instance is running', () => {
        beforeEach(async () => {
          instance.isRunning.mockImplementation(() => Promise.resolve(true));
          instance.process.getProcessId.mockImplementation(() => Promise.resolve(12345));
          result = await statusCommand.setup({ directory: '/' }, instance);
        });

        it("should have called the instance's isInstalled method", () => {
          expect(instance.isInstalled).toHaveBeenCalledTimes(1);
        });

        it("should have called the instance's isRunning method", () => {
          expect(instance.isRunning).toHaveBeenCalledTimes(1);
        });

        it("should have called the process's getProcessId method", () => {
          expect(instance.process.getProcessId).toHaveBeenCalledTimes(1);
        });

        it('should return an object with the directory installed: false, running: true', () => {
          expect(result).toMatchObject({
            directory: '/',
            installed: true,
            running: true,
            processId: 12345,
            version: '1.13.1',
          });
        });
      });
    });
  });
});
