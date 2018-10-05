// @flow
import { resolve as resolvePath } from 'path';
import {
  createCommandHandler,
  type CommandHandlerDefinition,
} from '../../util/commandHandler';

type InstanceArgs = {
  directory: string,
};
type InstanceInfo = InstanceArgs & {};

const infoCommand: CommandHandlerDefinition<InstanceArgs, InstanceInfo> = {
  command: 'info',
  description: 'Show information about an instance',
  async setup({ directory }): Promise<InstanceInfo> {
    return { directory: resolvePath(directory) };
  },
  render({ directory }) {
    return directory;
  },
};

export default createCommandHandler(infoCommand);
