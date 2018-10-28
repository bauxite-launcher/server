import JsonCollectionFile from '../../util/file/JsonCollectionFile';

export type ModInstallationSource =
  | { type: 'local' }
  | { type: 'remote', url: string }
  | { type: 'forge', projectId: number, fileId: number };

export type ModManifest = {
  path: string,
  from: ModInstallationSource,
};

class ModManifestFile extends JsonCollectionFile<ModManifest, ModManifest> {}

export default ModManifestFile;
