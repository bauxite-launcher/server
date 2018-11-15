// @flow
import { type Argv } from 'yargs';
import chalk from 'chalk';
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../commandHandler';
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
  description: 'Mods stuff',
  builder: yargs => yargs,
  async setup(args: Argv<ListModsArgs>, instance): Promise<ListModsOutput> {
    const mods = await instance.mods.listMods();
    return { mods };
  },
  render({ mods }) {
    const header = mods.length
      ? chalk.green(`${chalk.white(mods.length.toString())} mods installed:`)
      : chalk.grey('No mods are installed');
    const body = mods.length
      ? mods.map(({ manifest: { path } }) => ` - ${chalk.cyan(path)}`)
      : [];
    return [header, ...body];
  },
};

export default createCommandHandler(listModsCommand);
