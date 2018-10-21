// @flow
import Releases from './MinecraftReleaseList';
import RemoteFile from '../util/file/RemoteFile';

/**
 * There's a lot more to the actual version manifest, but we only care
 * about the bits relevant to downloading the server. For now. 😈
 */
type MinecraftReleaseManifest = {
  id: string,
  downloads: {
    server: { sha1: string, size: number, url: string },
  },
};

class MinecraftReleaseFile extends RemoteFile<MinecraftReleaseManifest> {
  static parse(rawValue: string): MinecraftReleaseManifest {
    return JSON.parse(rawValue);
  }

  static async fromReleaseId(id: string): Promise<MinecraftReleaseManifest> {
    const release = await Releases.findById(id);
    if (!release) {
      throw new Error(`There is no Minecraft release with ID "${id}"`);
    }
    const file = new MinecraftReleaseFile(release.url);
    return file.read();
  }
}

export default MinecraftReleaseFile;
