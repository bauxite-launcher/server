// @flow
import parseDate from 'date-fns/parse';
import RemoteFile from '../util/file/RemoteFile';
import type { MinecraftReleaseId } from './MinecraftReleaseList';

const MANIFEST_URL = 'https://files.minecraftforge.net/maven/net/minecraftforge/forge/json';

export type ForgeBuildId = number;
export type ForgeReleaseId = string;
export type ForgeBranchName = string;
export type ForgePromoId = string;

export type ForgeReleaseChannel = 'recommended' | 'latest';

export type FileType = 'zip' | 'txt' | 'jar' | 'exe';
export type ForgeReleaseFileType =
  | 'mdk'
  | 'changelog'
  | 'universal'
  | 'userdev'
  | 'installer'
  | 'installer-win';
export type RawForgeReleaseFile = [FileType, ForgeReleaseFileType, string];

export type RawForgeRelease = {
  build: ForgeBuildId,
  branch: ForgeBranchName | null,
  version: ForgeReleaseId,
  modified: number,
  mcversion: MinecraftReleaseId,
  files: Array<RawForgeReleaseFile>,
};

export type ForgeReleaseFile = {
  fileType: FileType,
  releaseFileType: ForgeReleaseFileType,
  url: string,
  sha1: string,
};

export type ForgeRelease = {
  id: ForgeBuildId,
  name: ForgeReleaseId,
  branch: ForgeBranchName | null,
  releaseTime: Date,
  minecraftVersion: MinecraftReleaseId,
  files: { [fileType: ForgeReleaseFileType]: ForgeReleaseFile },
};

// TODO: To be supportive of Forge, we should show their ad to user somehow
export type ForgeReleaseManifest = {
  adfocus: string,
  artifact: 'forge',
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
    webpath: string,
    mavenArtifact: string,
  ): ForgeRelease {
    const releaseTime = parseDate(modified);
    const files = rawFiles.reduce((acc, [fileType, releaseFileType, sha1]) => {
      acc[releaseFileType] = {
        fileType,
        releaseFileType,
        sha1,
        url: `${webpath}${minecraftVersion}-${name}/${mavenArtifact}-${minecraftVersion}-${name}-${releaseFileType}.${fileType}`,
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

  async getReleaseById(id: ForgeReleaseId): Promise<ForgeRelease> {
    const manifest: ForgeReleaseManifest = await this.read();
    const build = Object.keys(manifest.number)
      .map(buildId => parseInt(buildId, 10))
      .map(buildId => manifest.number[buildId])
      .find(thisBuild => thisBuild.version === id);
    if (!build) {
      throw new Error(`There is no Forge release with version name "${id}`);
    }
    return this.constructor.parseRelease(
      build,
      manifest.webpath,
      manifest.artifact,
    );
  }

  async getReleaseByBuildId(buildId: ForgeBuildId): Promise<ForgeRelease> {
    const manifest: ForgeReleaseManifest = await this.read();
    const build = manifest.number[buildId];
    if (!build) {
      throw new Error(`There is no Forge release with a build ID "${buildId}`);
    }
    return this.constructor.parseRelease(
      build,
      manifest.webpath,
      manifest.artifact,
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
      throw new Error(
        `Forge does not support version ${minecraftVersion} (yet)`,
      );
    }
    const allBuilds = await Promise.all(
      supportedBuilds.map(buildId => this.getReleaseByBuildId(buildId)),
    );

    return allBuilds.filter(Boolean);
  }

  async getLatestForMinecraftVersion(
    minecraftVersion: MinecraftReleaseId,
    channel: ForgeReleaseChannel = 'recommended',
  ): Promise<ForgeRelease> {
    const { promos }: ForgeReleaseManifest = await this.read();
    const buildId: ?number = promos[`${minecraftVersion}-${channel}`];
    if (!buildId) {
      throw new Error(
        `There is no ${channel} version of Forge for Minecraft ${minecraftVersion}`,
      );
    }
    return this.getReleaseByBuildId(buildId);
  }

  async getLatest(
    channel: ForgeReleaseChannel = 'recommended',
  ): Promise<ForgeRelease> {
    const { promos }: ForgeReleaseManifest = await this.read();
    const buildId: ?number = promos[channel];
    if (!buildId) {
      throw new Error(`There is no ${channel} version of Forge`);
    }
    return this.getReleaseByBuildId(buildId);
  }
}

export default new ForgeReleaseListFile();
