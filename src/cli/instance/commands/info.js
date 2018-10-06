// @flow
import { inspect } from 'util';
import {
  createCommandHandler,
  type CommandHandlerDefinition,
} from '../../util/commandHandler';

type InstanceArgs = {
  directory: string,
};
type InstalledInstanceInfo = {
  installed: true,
  running: boolean,
  version?: string,
};
type UninstalledInstanceInfo = { installed: false };
type InstanceInfo = InstanceArgs &
  (InstalledInstanceInfo | UninstalledInstanceInfo);

const infoCommand: CommandHandlerDefinition<InstanceArgs, InstanceInfo> = {
  command: 'info',
  description: 'Show the current status of the instance',
  async setup({ directory }, instance): Promise<InstanceInfo> {
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

export default createCommandHandler(infoCommand);
