// @flow
import { copy as copyFile, pathExists, remove as removeFile } from 'fs-extra';
import { type StreamProgressCallback } from 'progress-stream';
import MinecraftInstance from '../Instance';
import TextFile from '../../util/file/TextFile';
import RemoteFile from '../../util/file/RemoteFile';
import {
  type ModManifest,
  type ModInstallationSource,
} from './ModManifestFile';

class ModInstance {
  instance: MinecraftInstance;

  manifest: ModManifest;

  absolutePath: string;

  get absolutePath() {
    return this.instance.path('mods', this.manifest.path);
  }

  constructor(instance: MinecraftInstance, manifest: ModManifest) {
    this.instance = instance;
    this.manifest = manifest;
  }

  async isInstalled() {
    return pathExists(this.absolutePath);
  }

  async remove() {
    await removeFile(this.absolutePath);
  }

  static async fromLocalFile(
    instance: MinecraftInstance,
    localFile: TextFile<*>,
    from: ModInstallationSource = { type: 'local' },
  ): Promise<ModInstance> {
    const targetPath = instance.path('mods', localFile.name);
    if (localFile.path !== targetPath) {
      await copyFile(localFile.path, targetPath);
    }
    return new ModInstance(instance, { path: localFile.name, from });
  }

  static async fromRemoteFile(
    instance: MinecraftInstance,
    remoteFile: RemoteFile<*>,
    from: ModInstallationSource = { type: 'remote', url: remoteFile.url },
    onProgress?: StreamProgressCallback,
  ): Promise<ModInstance> {
    const localFile = await TextFile.createFromRemoteFile(
      remoteFile,
      instance.path('mods'),
      undefined,
      undefined,
      onProgress,
    );

    return this.fromLocalFile(instance, localFile, from);
  }
}

export default ModInstance;
