import ArchivedFile from '../../util/file/ArchivedFile';

const MOD_METADATA = 'mcmod.info';

// TODO: Validate this schema
type ModMetadata = {
  modid: string,
  name: string,
  description: string,
  version: string,
  mcVersion: string,
  url: string,
  updateUrl: string,
  authorList: Array<string>,
  logoFile: string,
  screenshots: Array<string>,
  dependencies: Array<string>,
};

class ModMetadataFile extends ArchivedFile<Array<ModMetadata>> {
  constructor(modPath: string, encoding?: string) {
    super(modPath, MOD_METADATA, encoding);
  }

  static parse(rawFile: string) {
    const [{ modid, mcversion, ...rest }] = JSON.parse(rawFile);
    return { id: modid, mcVersion: mcversion, ...rest };
  }
}

export default ModMetadataFile;
