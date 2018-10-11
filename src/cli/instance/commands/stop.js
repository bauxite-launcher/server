// @flow
import { type Argv } from 'yargs';
import chalk from 'chalk';
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../commandHandler';

type StopArgs = {
  json?: boolean,
};

type StopOutput = {
  stopped: true,
};

export const stopCommand: CommandHandlerDefinition<StopArgs, StopOutput> = {
  command: 'stop',
  description: 'Stop Minecraft server',
  async setup({ json = false }: Argv<StopArgs>, instance): Promise<StopOutput> {
    const running = await instance.isRunning();
    if (!running) {
      throw new Error('The instance is not running');
    }

    if (!json) {
      console.log(chalk.cyan('Stopping Minecraft server…'));
    }

    await instance.kill();
    return { stopped: true };
  },
  render() {
    return chalk.green('Successfully stopped Minecraft server!');
  },
};

export default createCommandHandler(stopCommand);
