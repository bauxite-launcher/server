import fs from 'jest-plugin-fs';
import nock from 'nock';
import Instance from '../src/instance/Instance';

jest.mock('fs', () => require('jest-plugin-fs/mock'));

describe('E2E: Install', () => {
  let scope;
  beforeEach(() => {
    fs.mock();
  });

  afterEach(() => {
    fs.restore();
    if (scope) scope.done();
  });

  describe('Installing Minecraft 1.13.1', () => {
    const launcherDomain = 'https://launchermeta.mojang.com';
    const manifestPath = '/mc/game/version_manifest.json';
    const releasePath = '/mc/game/1.13.1.json';
    const serverJarPath = '/mc/game/minecraft_server.1.13.1.jar';
    const jarContent = '👊🌳⛏💎';

    beforeEach(() => {
      scope = nock(launcherDomain)
        .get(manifestPath)
        .reply(200, {
          versions: [{ id: '1.13.1', url: launcherDomain + releasePath }],
        })
        .get(releasePath)
        .reply(200, {
          downloads: { server: { url: launcherDomain + serverJarPath } },
        })
        .get(serverJarPath)
        .reply(200, jarContent, { 'Content-length': jarContent.length });
    });

    it('should create a new instance', async () => {
      const progressCallback = jest.fn();
      const instance = await Instance.create(
        '/instance',
        {
          name: 'Test Instance',
          minecraftVersion: '1.13.1',
        },
        progressCallback,
      );
      expect(instance).toBeInstanceOf(Instance);
      expect(progressCallback).toHaveBeenCalled();
      await expect(instance.isInstalled()).resolves.toBe(true);

      const files = fs.files();
      expect(files['/instance/instance.json']).toBeDefined();
      expect(files['/instance/eula.txt']).toBeDefined();
      expect(files['/instance/minecraft_server.1.13.1.jar']).toBe(jarContent);
    });
  });
});
