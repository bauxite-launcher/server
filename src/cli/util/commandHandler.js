// @flow
import { type ModuleObject, type Argv } from 'yargs';
import { resolve as resolvePath } from 'path';
import MinecraftInstance from '../../instance/Instance';

export type CommandHandlerDefinition<T, U> = {
  command: string,
  description: string,
  setup: (argv: Argv<T>, instance: MinecraftInstance) => U | Promise<U>,
  render: (options: U) => string | Array<string>,
};

// eslint-disable-next-line import/prefer-default-export
export function createCommandHandler<T: Object, U: Object>({
  command,
  description,
  setup,
  render,
}: CommandHandlerDefinition<T, U>): ModuleObject<T> {
  async function handler(argv, instance) {
    const args = await setup(argv, instance);
    const output = render(args);
    if (output instanceof Array) {
      // eslint-disable-next-line no-console
      output.forEach(line => console.log(line));
    } else {
      // eslint-disable-next-line no-console
      console.log(output);
    }
  }

  return {
    command,
    description,
    handler(argv) {
      const instance = new MinecraftInstance(resolvePath(argv.directory));

      // Not returning here ─ handler doesn't accept a Promise as a return type
      handler(argv, instance);
    },
  };
}
