// @flow
import { type ModuleObject, type Argv } from 'yargs';
import { resolve as resolvePath } from 'path';
import MinecraftInstance from '../../instance/Instance';

type ErrorRenderer = (error: Error, argv: *) => string | Array<string>;
const defaultErrorRenderer: ErrorRenderer = (error: Error) => `Something went wrong:\n\t${error.message}`;
const logToConsole = (output: string | Array<string>) => {
  if (output instanceof Array) {
    // eslint-disable-next-line no-console
    output.forEach(line => console.log(line));
  } else {
    // eslint-disable-next-line no-console
    console.log(output);
  }
};

export type CommandHandlerDefinition<T, U> = {
  command: string,
  description: string,
  setup: (argv: Argv<T>, instance: MinecraftInstance) => U | Promise<U>,
  render: (options: U) => string | Array<string>,
  renderError?: ErrorRenderer,
};

// eslint-disable-next-line import/prefer-default-export
export function createCommandHandler<T: Object, U: Object>({
  setup,
  render,
  renderError,
  command,
  description,
  ...rest
}: CommandHandlerDefinition<T, U>): ModuleObject<T> {
  async function handler(
    argv: Argv<T & { json: boolean }>,
    instance: MinecraftInstance,
  ): Promise<string | Array<string>> {
    const result = await setup(argv, instance);

    if (argv.json) {
      // eslint-disable-next-line no-console
      return JSON.stringify(result, null, 2);
    }

    return render(result);
  }

  async function tryHandler(
    argv: Argv<T & { json: boolean }>,
    instance: MinecraftInstance,
  ): Promise<void> {
    try {
      logToConsole(await handler(argv, instance));
    } catch (error) {
      const errorRenderer = renderError || defaultErrorRenderer;
      const renderedError = errorRenderer(error, argv);
      logToConsole(renderedError);
    }
  }

  return {
    ...rest,
    command,
    description,
    handler(argv: Argv<T> & { directory: string }) {
      const directory = resolvePath(argv.directory);
      const instance: MinecraftInstance = new MinecraftInstance(directory);

      tryHandler(argv, instance);
    },
  };
}
