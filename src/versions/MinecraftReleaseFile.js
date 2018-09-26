// @flow
import MinecraftReleaseListFile from "./MinecraftReleaseListFile";
import RemoteJsonFile from "../util/RemoteJsonFile";

/**
 * There's a lot more to the actual version manifest, but we only care
 * about the bits relevant to downloading the server. For now. 😈
 */
type MinecraftReleaseManifest = {
  id: string,
  downloads: {
    server: { sha1: string, size: number, url: string }
  }
};

class MinecraftReleaseFile extends RemoteJsonFile<MinecraftReleaseManifest> {
  static async fromReleaseId(id: string): Promise<MinecraftReleaseFile> {
    const releaseList = new MinecraftReleaseListFile();
    const release = await releaseList.findById(id);
    if (!release) {
      throw new Error(`There is no Minecraft release with ID "${id}"`);
    }
    return new MinecraftReleaseFile(release.url);
  }
}

export default MinecraftReleaseFile;
