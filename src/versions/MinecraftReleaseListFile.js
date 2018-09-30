// @flow
import RemoteFile from '../util/RemoteFile';

const MANIFEST_URL = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';

type ReleaseId = string;
type ReleaseType = "release" | "snapshot" | "old_alpha" | "old_beta";

type MinecraftRelease = {
  id: ReleaseId,
  url: string,
  type: ReleaseType,
  time: string,
  releaseTime: string
};

type MinecraftReleaseManifest = {
  versions: Array<MinecraftRelease>,
  latest: { [releaseType: ReleaseType]: ReleaseId }
};

class MinecraftReleaseListFile extends RemoteFile<MinecraftReleaseManifest> {
  static defaultUrl: string = MANIFEST_URL;

  static parse(rawValue: string): MinecraftReleaseManifest {
    return JSON.parse(rawValue);
  }

  constructor() {
    super(MANIFEST_URL);
  }

  async releases(): Promise<Array<MinecraftRelease>> {
    const { versions } = await this.read();
    return versions;
  }

  async findById(releaseId: ReleaseId): Promise<?MinecraftRelease> {
    const { versions } = await this.read();
    return versions.find(({ id }) => id === releaseId);
  }

  async latest(
    releaseType: ReleaseType = 'release',
  ): Promise<?MinecraftRelease> {
    const { latest } = await this.read();
    const releaseId = latest[releaseType];
    if (!releaseId) return null;
    return this.findById(releaseId);
  }
}

export default MinecraftReleaseListFile;
