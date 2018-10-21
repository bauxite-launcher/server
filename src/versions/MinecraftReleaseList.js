// @flow
import RemoteFile from '../util/file/RemoteFile';

const MANIFEST_URL = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';

export type MinecraftReleaseId = string;
export type MinecraftReleaseType =
  | 'release'
  | 'snapshot'
  | 'old_alpha'
  | 'old_beta';

export type MinecraftRelease = {
  id: MinecraftReleaseId,
  url: string,
  type: MinecraftReleaseType,
  time: string,
  releaseTime: string,
};

export type MinecraftReleaseManifest = {
  versions: Array<MinecraftRelease>,
  latest: { [releaseType: MinecraftReleaseType]: MinecraftReleaseId },
};

export class MinecraftReleaseListFile extends RemoteFile<
  MinecraftReleaseManifest,
> {
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

  async findById(releaseId: MinecraftReleaseId): Promise<?MinecraftRelease> {
    const { versions } = await this.read();
    return versions.find(({ id }) => id === releaseId);
  }

  async latest(
    releaseType: MinecraftReleaseType = 'release',
  ): Promise<?MinecraftRelease> {
    const { latest } = await this.read();
    const releaseId = latest[releaseType];
    if (!releaseId) return null;
    return this.findById(releaseId);
  }
}

export default new MinecraftReleaseListFile();
