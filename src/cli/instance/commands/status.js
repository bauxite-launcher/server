// @flow
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../commandHandler';
import { definitionList, booleanValue, integerValue } from './util/components';

type InstanceArgs = {
  directory: string,
};
type InstanceStatus = {
  directory: string,
  installed: boolean,
  running?: boolean,
  processId?: ?number,
  version?: string,
  forgeInstalled?: boolean,
  forgeVersion?: string,
};

export const statusCommand: CommandHandlerDefinition<
  InstanceArgs,
  InstanceStatus,
> = {
  command: 'status',
  description: 'Show the current status of the instance',
  async setup({ directory }: InstanceArgs, instance): Promise<InstanceStatus> {
    const installed = await instance.isInstalled();
    if (!installed) return { directory, installed };

    const forgeInstalled = await instance.isForgeInstalled();
    const running = await instance.isRunning();
    const { minecraftVersion, forgeVersion } = await instance.settings.read();
    const processId = await instance.process.getProcessId();

    return {
      directory,
      installed,
      running,
      processId,
      version: minecraftVersion,
      forgeInstalled,
      forgeVersion,
    };
  },
  render({
    directory,
    installed,
    forgeInstalled,
    running = false,
    version,
    forgeVersion,
    processId,
  }: InstanceStatus) {
    const header = { Directory: directory, Installed: booleanValue(installed) };

    const body = installed
      ? {
        'Minecraft Version': version,
      }
      : {};

    // eslint-disable-next-line no-nested-ternary
    const whileRunning = installed
      ? running
        ? {
          Running: booleanValue(running),
          'Process ID': integerValue(processId),
        }
        : { Running: booleanValue(running) }
      : {};

    const forge = forgeInstalled
      ? {
        'Forge Installed': booleanValue(forgeInstalled),
        'Forge Version': forgeVersion,
      }
      : {};
    return definitionList({
      ...header,
      ...body,
      ...forge,
      ...whileRunning,
    });
  },
};

export default createCommandHandler(statusCommand);
