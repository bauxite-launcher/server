// @flow
import MinecraftReleaseListFile from "./MinecraftReleaseList";
import RemoteFile from "../util/RemoteFile";

type MinecraftReleaseManifest = {
  id: string,
  downloads: {
    server: { sha1: string, size: number, url: string }
  }
};

class MinecraftReleaseFile extends RemoteFile<MinecraftReleaseManifest> {
  static async fromReleaseId(id: string): Promise<MinecraftReleaseFile> {
    const releaseList = new MinecraftReleaseListFile();
    const release = await releaseList.findById(id);
    if (!release) {
      throw new Error(`There is no Minecraft release with ID "${id}"`);
    }
    return new this(release.url);
  }

  async read(): Promise<MinecraftReleaseManifest> {
    return this.readAsObject();
  }
}

export default MinecraftReleaseFile;
