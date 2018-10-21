// @flow
import parseDate from 'date-fns/parse';
import RemoteFile from '../util/file/RemoteFile';
import type { MinecraftReleaseId } from './MinecraftReleaseList';

const MANIFEST_URL = 'http://files.minecraftforge.net/maven/net/minecraftforge/forge/json';

type ForgeBuildId = number;
type ForgeReleaseId = string;
type ForgeBranchName = string;
type ForgePromoId = string;

type ForgeReleaseChannel = 'recommended' | 'latest';

type FileType = 'zip' | 'txt' | 'jar' | 'exe';
type ForgeReleaseFileType =
  | 'mdk'
  | 'changelog'
  | 'universal'
  | 'userdev'
  | 'installer'
  | 'installer-win';
type RawForgeReleaseFile = [FileType, ForgeReleaseFileType, string];

type RawForgeRelease = {
  build: ForgeBuildId,
  branch: ForgeBranchName | null,
  version: ForgeReleaseId,
  modified: number,
  mcversion: MinecraftReleaseId,
  files: Array<RawForgeReleaseFile>,
};

type ForgeReleaseFile = {
  fileType: FileType,
  releaseFileType: ForgeReleaseFileType,
  url: string,
  sha1: string,
};

type ForgeRelease = {
  id: ForgeBuildId,
  name: ForgeReleaseId,
  branch: ForgeBranchName | null,
  releaseTime: Date,
  minecraftVersion: MinecraftReleaseId,
  files: { [fileType: ForgeReleaseFileType]: ForgeReleaseFile },
};

// TODO: To be supportive of Forge, we should show their ad to user somehow
type ForgeReleaseManifest = {
  adfocus: string,
  artifact: ['forge'],
  branches: { [branchName: ForgeBranchName]: Array<ForgeBuildId> },
  homepage: string,
  mcversion: { [minecraftVersion: MinecraftReleaseId]: Array<ForgeBuildId> },
  name: string,
  number: { [releaseId: ForgeBuildId]: RawForgeRelease },
  promos: { [promoId: ForgePromoId]: ForgeBuildId },
  webpath: string,
};

export class ForgeReleaseListFile extends RemoteFile<ForgeReleaseManifest> {
  static defaultUrl: string = MANIFEST_URL;

  static parse(rawValue: string): ForgeReleaseManifest {
    const manifest: ForgeReleaseManifest = JSON.parse(rawValue);
    return manifest;
  }

  static parseRelease(
    {
      build: id,
      version: name,
      branch,
      modified,
      mcversion: minecraftVersion,
      files: rawFiles,
    }: RawForgeRelease,
    homepage: string,
    mavenName: string,
  ): ForgeRelease {
    const releaseTime = parseDate(modified);
    const files = rawFiles.reduce((acc, [fileType, releaseFileType, sha1]) => {
      acc[releaseFileType] = {
        fileType,
        releaseFileType,
        sha1,
        url: `${homepage}/${minecraftVersion}-${name}/${mavenName}-${minecraftVersion}-${releaseFileType}.${fileType}`,
      };
      return acc;
    }, {});
    return {
      id,
      name,
      branch,
      minecraftVersion,
      releaseTime,
      files,
    };
  }

  constructor() {
    super(MANIFEST_URL);
  }

  async getReleaseByBuildId(buildId: ForgeBuildId): Promise<?ForgeRelease> {
    const manifest: ForgeReleaseManifest = await this.read();
    return this.constructor.parseRelease(
      manifest.number[buildId],
      manifest.homepage,
      manifest.name,
    );
  }

  async getReleasesByMinecraftVersion(
    minecraftVersion: MinecraftReleaseId,
  ): Promise<Array<ForgeRelease>> {
    const {
      mcversion: byMinecraftVersion,
    }: ForgeReleaseManifest = await this.read();
    const supportedBuilds = byMinecraftVersion[minecraftVersion];
    if (!supportedBuilds) {
      return [];
    }
    const allBuilds = await Promise.all(
      supportedBuilds.map(buildId => this.getReleaseByBuildId(buildId)),
    );

    return allBuilds.filter(Boolean);
  }

  async getLatestForMinecraftVersion(
    minecraftVersion: MinecraftReleaseId,
    channel: ForgeReleaseChannel = 'recommended',
  ): Promise<?ForgeRelease> {
    const { promos }: ForgeReleaseManifest = await this.read();
    const buildId: ?number = promos[`${minecraftVersion}-${channel}`];
    if (!buildId) {
      return undefined;
    }
    return this.getReleaseByBuildId(buildId);
  }
}

export default new ForgeReleaseListFile();
