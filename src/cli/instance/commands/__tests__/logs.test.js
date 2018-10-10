import { logsCommand } from '../logs';
import MinecraftInstance from '../../../../instance/Instance';
import ServerProcess from '../../../../instance/Process';
import SettingsFile from '../../../../instance/files/SettingsFile';

jest.mock('../../../../instance/Instance');
jest.mock('../../../../instance/Process');
jest.mock('../../../../instance/files/SettingsFile');

const originalConsoleLog = console.log;

// TODO: Test render method

describe('logs command', () => {
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
    global.console.logs = originalConsoleLog;
  });

  it('should be an object', () => {
    expect(logsCommand).toBeInstanceOf(Object);
  });

  it('should have a name and description', () => {
    expect(logsCommand).toHaveProperty('command', 'logs');
    expect(logsCommand).toHaveProperty('description');
  });

  it('should have a setup method', () => {
    expect(logsCommand.setup).toBeInstanceOf(Function);
  });

  it('should have a render method', () => {
    expect(logsCommand.render).toBeInstanceOf(Function);
  });

  describe('setup method', () => {
    describe('when the instance is not installed', () => {
      beforeEach(() => {
        instance.isInstalled.mockImplementation(() => Promise.resolve(false));
      });

      it('should should throw an error', async () => {
        await expect(
          logsCommand.setup({ directory: '/' }, instance),
        ).rejects.toBeInstanceOf(Error);
      });
    });

    describe('when the instance is installed', () => {
      beforeEach(() => {
        instance.isInstalled.mockImplementation(() => Promise.resolve(true));
      });

      describe('when called without argument', () => {});
      describe('when called with a lines argument', () => {});
      describe('when called with a date argument', () => {});
    });
  });
});
