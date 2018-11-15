// @flow
import MinecraftInstance from '../Instance';
import ModManifestFile from './ModManifestFile';
import ModInstance from './ModInstance';

const MOD_MANIFEST = 'mods.json';

class ModManager {
  instance: MinecraftInstance;

  manifest: ModManifestFile;

  constructor(instance: MinecraftInstance) {
    this.instance = instance;
    this.manifest = new ModManifestFile(instance.path(MOD_MANIFEST));
  }

  async listMods(): Promise<Array<ModInstance>> {
    const modList = await this.manifest.read();
    return modList.map(manifest => new ModInstance(this.instance, manifest));
  }

  async addMod(modInstance: ModInstance) {
    if (!(await modInstance.isInstalled())) {
      throw new Error('Mod is not yet installed.');
    }

    const [metadata, manifest] = await Promise.all([
      modInstance.metadata.read(),
      modInstance.manifest,
    ]);

    await this.manifest.add({ ...manifest, metadata });
  }

  async removeMod(modInstance: ModInstance) {
    const modPath = modInstance.manifest.path;

    if (await modInstance.isInstalled()) {
      await modInstance.remove();
    }

    await this.manifest.remove(item => item.path === modPath);
  }

  async areAllModsInstalled(): Promise<boolean> {
    const allMods = await this.listMods();
    return allMods.reduce(
      (prev, mod) => prev.then(installed => (installed ? mod.isInstalled() : false)),
      Promise.resolve(true),
    );
  }
}

export default ModManager;
