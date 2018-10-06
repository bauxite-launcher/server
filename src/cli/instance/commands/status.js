// @flow
import { inspect } from 'util';
import {
  createCommandHandler,
  type CommandHandlerDefinition,
} from '../../util/commandHandler';

type InstanceArgs = {
  directory: string,
};
type InstalledInstanceStatus = {
  installed: true,
  running: boolean,
  version?: string,
};
type UninstalledInstanceStatus = { installed: false };
type InstanceStatus = InstanceArgs &
  (InstalledInstanceStatus | UninstalledInstanceStatus);

const statusCommand: CommandHandlerDefinition<InstanceArgs, InstanceStatus> = {
  command: 'status',
  description: 'Show the current status of the instance',
  async setup({ directory }, instance): Promise<InstanceStatus> {
    const installed = await instance.isInstalled();
    if (!installed) return { directory, installed: false };

    const running = await instance.isRunning();
    const { minecraftVersion } = await instance.settings.read();

    return {
      directory,
      installed: true,
      running,
      version: minecraftVersion,
    };
  },
  render(data) {
    return inspect(data, { colors: true });
  },
};

export default createCommandHandler(statusCommand);
