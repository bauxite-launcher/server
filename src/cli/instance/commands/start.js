// @flow
import { type Argv } from 'yargs';
import chalk from 'chalk';
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../commandHandler';

type StartArgs = {
  json?: boolean,
};

type StartOutput = {
  pid: number,
  started: true,
};

export const startCommand: CommandHandlerDefinition<StartArgs, StartOutput> = {
  command: 'start',
  description: 'Start Minecraft server',
  async setup(
    { json = false }: Argv<StartArgs>,
    instance,
  ): Promise<StartOutput> {
    const installed = await instance.isInstalled();
    if (!installed) {
      throw new Error('The instance has not been installed yet.');
    }

    if (!json) {
      console.log(chalk.cyan('Starting Minecraft server…'));
    }

    await instance.launch();
    const pid = await instance.process.getProcessId();
    if (!pid) {
      throw new Error('No process ID found');
    }
    return { started: true, pid };
  },
  render({ pid }) {
    return chalk.green(
      `Successfully started Minecraft server (process ID: ${chalk.white(
        pid.toString(),
      )})!`,
    );
  },
};

export default createCommandHandler(startCommand);
