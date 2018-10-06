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
  setup,
  render,
  ...rest
}: CommandHandlerDefinition<T, U>): ModuleObject<T> {
  async function handler(
    argv: Argv<T & { json: boolean }>,
    instance: MinecraftInstance,
  ) {
    const args = await setup(argv, instance);

    if (argv.json) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(args, null, 2));
      return;
    }

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
    ...rest,
    handler(argv: Argv<T & { directory: string }>) {
      const instance: MinecraftInstance = new MinecraftInstance(
        resolvePath(argv.directory),
      );

      // Not returning here ─ handler doesn't accept a Promise as a return type
      handler(argv, instance);
    },
  };
}
