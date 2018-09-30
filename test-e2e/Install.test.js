import fs from 'jest-plugin-fs';
import Instance from '../src/instance/Instance';

jest.mock('fs', () => require('jest-plugin-fs/mock'));

describe('Integration: Install', () => {
  beforeEach(() => {
    fs.mock();
  });

  afterEach(() => {
    fs.restore();
  });

  describe('Installing Minecraft 1.13.1', () => {
    jest.setTimeout(1e6);

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
      expect(files['/instance/minecraft_server.1.13.1.jar']).toBeDefined();
    });
  });
});
