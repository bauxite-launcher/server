// @flow
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../commandHandler';

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
    running,
    version,
    processId,
  }: InstanceStatus) {
    const header = `Directory:\t\t${directory}`;
    const body = installed
      ? [
        'Installed:\t\tYes',
        `Running:\t\t${running ? 'Yes' : 'No'}`,
        processId ? `Process ID:\t\t${processId}` : '',
        version ? `Minecraft Version:\t${version}` : '',
      ]
      : ['Installed:\tNo'];
    return [header, ...body];
  },
};

export default createCommandHandler(statusCommand);
