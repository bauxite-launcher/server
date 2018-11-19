// @flow
import { type Argv } from 'yargs';
import chalk from 'chalk';
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../commandHandler';
import ModInstance from '../../../instance/mods/ModInstance';
import TextFile from '../../../util/file/TextFile';
import RemoteTextFile from '../../../util/file/RemoteFile';
import { type ModManifest } from '../../../instance/mods/ModManifestFile';
import { type ModMetadata } from '../../../instance/mods/ModMetadataFile';
import { definitionList } from './util/components';

type InstallModArgs = {
  url?: string,
  path?: string,
  forgeProjectId?: string,
  forgeFileId?: string,
};

type InstallModOutput = {
  mod: ModManifest,
  meta: ModMetadata,
};

const newMod = async (
  instance,
  {
    url, path, forgeProjectId, forgeFileId,
  }: InstallModArgs,
) => {
  if (path) {
    return ModInstance.fromLocalFile(instance, new TextFile(path));
  }
  if (url) {
    return ModInstance.fromRemoteFile(instance, new RemoteTextFile(url));
  }
  if (forgeProjectId) {
    if (!forgeFileId) {
      throw new Error(
        'Forge file ID is required if Forge project ID is supplied',
      );
    }
    return ModInstance.fromCurseForgeProject(
      instance,
      forgeProjectId,
      forgeFileId,
    );
  }
  throw new Error('Path, URL or CurseForge project ID required');
};

export const installModCommand: CommandHandlerDefinition<
  InstallModArgs,
  InstallModOutput,
> = {
  command: 'install-mod',
  description: 'Installs a mod on a Forge-enabled instance',
  builder: yargs => yargs
    .options({
      url: {
        type: 'string',
        description: 'The URL of the mod JAR file to download',
      },
      path: {
        type: 'string',
        description: 'The path to the local JAR file.',
      },
      forgeProjectId: {
        type: 'string',
      },
      forgeFileId: {
        type: 'string',
        default: 'latest',
      },
    })
    .conflicts({
      url: ['path', 'forgeProjectId', 'forgeFileId'],
      path: ['forgeProjectId', 'forgeFileId'],
    }),
  async setup(
    {
      url, path, forgeProjectId, forgeFileId,
    }: Argv<InstallModArgs>,
    instance,
  ): Promise<InstallModOutput> {
    const mod: ModInstance = await newMod(instance, {
      url,
      path,
      forgeProjectId,
      forgeFileId,
    });
    await instance.mods.addMod(mod);
    return { mod: mod.manifest, meta: await mod.metadata.read() };
  },
  render({ meta: { name, description, version } }) {
    return [
      chalk.green('Successfully installed mod!'),
      definitionList({ name, description, version }),
    ];
  },
};

export default createCommandHandler(installModCommand);
