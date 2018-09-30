import nock from 'nock';
import fs from 'jest-plugin-fs';
import Installer from '../Installer';
import Instance from '../Instance';

jest.mock('fs', () => require('jest-plugin-fs/mock'));

const mockInstancePath = '/instance';
const mockServerJar = 'minecraft_server.jar';

const makeInstance = () => ({
  directory: mockInstancePath,
  path: jest.fn(Instance.prototype.path),
  settings: {
    read: jest.fn(() => Promise.resolve({ minecraftVersion: '1.13.1', serverJar: mockServerJar })),
    write: jest.fn(() => Promise.resolve()),
    patch: jest.fn(() => Promise.resolve()),
  },
  eula: {
    read: jest.fn(() => Promise.resolve(false)),
    accept: jest.fn(() => Promise.resolve()),
  },
});
const makeInstaller = (instance = makeInstance()) => new Installer(instance);

describe('Installer', () => {
  it('should be a function', () => {
    expect(Installer).toBeInstanceOf(Function);
  });

  describe('when instantiated without an instance', () => {
    it('should throw an error', () => {
      expect(() => new Installer()).toThrowError();
    });
  });

  describe('when instantiated with an instance', () => {
    it('should not throw an error', () => {
      expect(makeInstaller).not.toThrowError();
    });
  });

  describe('class methods', () => {
    let installer; let
      instance;

    beforeEach(() => {
      fs.mock();
      instance = makeInstance();
      installer = makeInstaller(instance);
    });
    afterEach(() => {
      fs.restore();
    });

    describe('directoryExists', () => {
      it('should be a function', () => {
        expect(installer.directoryExists).toBeInstanceOf(Function);
      });

      describe('when the directory does not exist', () => {
        it('should return false', async () => {
          await expect(installer.directoryExists()).resolves.toBe(false);
        });
      });

      describe('when the directory does exist', () => {
        beforeEach(() => fs.mock({ [`${mockInstancePath}/test.txt`]: '' }));
        it('should return true', async () => {
          await expect(installer.directoryExists()).resolves.toBe(true);
        });
      });
    });

    describe('ensureDirectoryExists', () => {
      it('should be a function', () => {
        expect(installer.ensureDirectoryExists).toBeInstanceOf(Function);
      });

      describe('when the directory does not exist', () => {
        it('should create the directory', async () => {
          await installer.ensureDirectoryExists();
          expect(fs.files()[mockInstancePath]).toBeDefined();
        });
      });

      describe('when the directory does exist', () => {
        beforeEach(() => fs.mock({
          [`${mockInstancePath}/test.txt`]: '',
        }));

        it('the directory should continue to exist', async () => {
          await installer.ensureDirectoryExists();
          expect(fs.files()[`${mockInstancePath}/test.txt`]).toBeDefined();
        });
      });
    });

    describe('serverJarExists', () => {
      it('should be a function', () => {
        expect(installer.serverJarExists).toBeInstanceOf(Function);
      });

      describe('when the server jar does not exist', () => {
        it('should return false', async () => {
          await expect(installer.serverJarExists()).resolves.toBe(false);
        });
      });

      describe('when the server jar does exist', () => {
        beforeEach(() => {
          fs.mock({ [`${mockInstancePath}/${mockServerJar}`]: '' });
        });
        it('should return true', async () => {
          await expect(installer.serverJarExists()).resolves.toBe(true);
        });
      });
    });

    describe('downloadServerJar', () => {
      const serverJarContent = '💎⛏🌳👊';

      let scope;
      afterEach(() => {
        if (scope) scope.done();
      });

      it('should be a function', () => {
        expect(installer.downloadServerJar).toBeInstanceOf(Function);
      });

      describe('when called', () => {
        beforeEach(async () => {
          fs.mock({
            [`${mockInstancePath}/test.txt`]: '',
          });
          scope = nock('https://launchermeta.mojang.com')
            .get('/mc/game/version_manifest.json')
            .reply(200, {
              versions: [
                {
                  id: '1.13.1',
                  url: 'https://launchermeta.mojang.com/1.13.1.json',
                },
              ],
            })
            .get('/1.13.1.json')
            .reply(200, {
              downloads: {
                server: { url: 'https://launchermeta.mojang.com/server.jar' },
              },
            })
            .get('/server.jar')
            .reply(200, serverJarContent);
          await expect(
            installer.downloadServerJar('1.13.1'),
          ).resolves.toBeUndefined();
        });

        it('should write the server jar to disk at the specified path', async () => {
          expect(
            fs.files()[`${mockInstancePath}/minecraft_server.1.13.1.jar`],
          ).toBe(serverJarContent);
        });

        it('should update the settings file with the new server JAR path', async () => {
          expect(instance.settings.patch).toHaveBeenCalledWith({
            minecraftVersion: '1.13.1',
            serverJar: 'minecraft_server.1.13.1.jar',
          });
        });
      });
    });

    describe('eulaAgreed', () => {
      it('should be a function', () => {
        expect(installer.eulaAgreed).toBeInstanceOf(Function);
      });

      describe('when called', () => {
        beforeEach(() => installer.eulaAgreed());
        it("should call the instance's eula.read method", async () => {
          expect(instance.eula.read).toHaveBeenCalled();
        });
      });
    });

    describe('agreeToEula', () => {
      it('should be a function', () => {
        expect(installer.agreeToEula).toBeInstanceOf(Function);
      });

      describe('when called', () => {
        beforeEach(() => installer.agreeToEula());
        it("should call the instance's eula.accept method", async () => {
          expect(instance.eula.accept).toHaveBeenCalled();
        });
      });
    });

    describe('writeSettings', () => {
      it('should be a function', () => {
        expect(installer.writeSettings).toBeInstanceOf(Function);
      });

      describe('when called', () => {
        beforeEach(() => installer.writeSettings({
          minecraftVersion: '1.13.1',
          serverJar: mockServerJar,
        }));

        it("should call the instance's settings.write method", async () => {
          expect(instance.settings.patch).toHaveBeenCalledWith({
            minecraftVersion: '1.13.1',
            serverJar: mockServerJar,
          });
        });
      });
    });
  });
});
