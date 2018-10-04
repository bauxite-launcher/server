// @flow
import {
  createCommandHandler,
  type CommandHandlerDefinition,
} from '../../util/commandHandler';
import pkg from '../../../../package.json';

type Package = {
  name: string,
  version: string,
};

const infoCommand: CommandHandlerDefinition<{}, Package> = {
  command: 'info',
  description: 'Show the info',
  async setup(): Promise<Package> {
    return pkg;
  },
  render({ name, version }) {
    return `${name} v${version}`;
  },
};

export default createCommandHandler(infoCommand);
