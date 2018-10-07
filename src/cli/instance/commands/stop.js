// @flow
import { type Argv } from 'yargs';
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../../util/commandHandler';

type StopArgs = {
  json?: boolean,
};

type StopOutput = {
  stopped: true,
};

const stopCommand: CommandHandlerDefinition<StopArgs, StopOutput> = {
  command: 'stop',
  description: 'Stop Minecraft server',
  async setup({ json = false }: Argv<StopArgs>, instance): Promise<StopOutput> {
    const running = await instance.isRunning();
    if (!running) {
      throw new Error('The instance is not running');
    }

    if (!json) {
      console.log('Stopping Minecraft server…');
    }

    await instance.kill();
    return { stopped: true };
  },
  render() {
    return 'Successfully stopped Minecraft server';
  },
};

export default createCommandHandler(stopCommand);
