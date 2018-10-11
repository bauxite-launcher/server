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

    const running = await instance.isRunning();
    const { minecraftVersion } = await instance.settings.read();
    const processId = await instance.process.getProcessId();

    return {
      directory,
      installed,
      running,
      processId,
      version: minecraftVersion,
    };
  },
  render({
    directory,
    installed,
    running = false,
    version,
    processId,
  }: InstanceStatus) {
    const header = { Directory: directory, Installed: booleanValue(installed) };

    const body = installed
      ? {
        Running: booleanValue(running),
        'Process ID': integerValue(processId),
        'MC Version': version,
      }
      : {};
    return definitionList({ ...header, ...body });
  },
};

export default createCommandHandler(statusCommand);
