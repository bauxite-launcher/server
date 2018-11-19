// @flow
import { type Argv } from 'yargs';
import chalk from 'chalk';
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../commandHandler';
import { type ModMetadata } from '../../../instance/mods/ModMetadataFile';
import ModInstance from '../../../instance/mods/ModInstance';
import { definitionList } from './util/components';

type RemoveModArgs = {
  path?: string,
  forgeProjectId?: string,
};

type RemoveModOutput = ModMetadata;

const modFinder = ({
  path,
  forgeProjectId,
}: RemoveModArgs): (ModInstance => boolean) => {
  if (path) {
    return item => item.relativePath.replace(/^\/\./, '').startsWith(path)
      || item.relativePath.replace(/\.jar$/, '').endsWith(path);
  }
  if (forgeProjectId) {
    return item => item.metadata.forgeProjectId.toString() === forgeProjectId.toString();
  }
  throw new Error('Cannot find mod without a path or forgeProjectId');
};

export const removeModCommand: CommandHandlerDefinition<
  RemoveModArgs,
  RemoveModOutput,
> = {
  command: 'remove-mod',
  description: 'Removes an installed mod',
  builder: yargs => yargs
    .options({
      path: {
        type: 'string',
        description: 'The (partial) local path of the mod to remove',
      },
      forgeProjectId: {
        type: 'string',
        description: 'The CurseForge project ID of the mod to remove',
      },
    })
    .conflicts({
      path: ['forgeProjectId'],
    }),
  async setup(
    { path, forgeProjectId }: Argv<RemoveModArgs>,
    instance,
  ): Promise<RemoveModOutput> {
    const allMods = await instance.mods.listMods();
    const findMod = modFinder({ path, forgeProjectId });
    const modInstance = allMods.find(findMod);
    if (!modInstance) {
      throw new Error('Cannot find mod');
    }
    const { metadata } = modInstance.manifest;
    await instance.mods.removeMod(modInstance);
    return metadata;
  },
  render({ name, version }) {
    return [
      chalk.green('Successfully removed mod!'),
      definitionList({ Name: name, Version: version }),
    ];
  },
};

export default createCommandHandler(removeModCommand);
