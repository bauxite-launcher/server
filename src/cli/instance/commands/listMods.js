// @flow
import { type Argv } from 'yargs';
import chalk from 'chalk';
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../commandHandler';
import { definitionList } from './util/components';
import ModInstance from '../../../instance/mods/ModInstance';

type ListModsArgs = {};

type ListModsOutput = {
  mods: Array<ModInstance>,
};

export const listModsCommand: CommandHandlerDefinition<
  ListModsArgs,
  ListModsOutput,
> = {
  command: 'list-mods',
  description: 'List the installed mods',
  builder: yargs => yargs,
  async setup(args: Argv<ListModsArgs>, instance): Promise<ListModsOutput> {
    const mods = await instance.mods.listMods();
    return { mods };
  },
  render({ mods }) {
    const header = mods.length
      ? chalk.green(
        `${chalk.white(mods.length.toString())} mod${
          mods.length > 1 ? 's' : ''
        } installed:`,
      )
      : chalk.grey('No mods are installed');
    const body = definitionList(
      mods.reduce((acc, { manifest: { path, metadata } }) => {
        acc[path] = `${metadata.name} (${metadata.version})`;
        return acc;
      }, {}),
    );
    return [header, body];
  },
};

export default createCommandHandler(listModsCommand);
