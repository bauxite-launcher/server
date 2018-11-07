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

type InstallModArgs = {
  url?: string,
  path?: string,
  forgeProjectId?: string,
  forgeFileId?: string,
};

type InstallModOutput = {
  mod: ModManifest,
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
  description: 'Mods stuff',
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
    const mod = await newMod(instance, {
      url,
      path,
      forgeProjectId,
      forgeFileId,
    });
    await instance.mods.addMod(mod);
    return { mod: mod.manifest };
  },
  render({ mod }) {
    return 'Done';
  },
};

export default createCommandHandler(installModCommand);
