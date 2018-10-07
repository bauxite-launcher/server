// @flow
import { type ModuleObject, type Argv, type ModuleBuilder } from 'yargs';
import { resolve as resolvePath } from 'path';
import MinecraftInstance from '../../instance/Instance';

type ErrorRenderer = (error: Error, argv: *) => string | Array<?string>;
const defaultErrorRenderer: ErrorRenderer = (error: Error) => `Something went wrong:\n\t${error.message}`;
const logToConsole = (result: string | Array<?string>) => {
  const output = result instanceof Array ? result.join('\n') : result;
  process.stdout.write(`${output}\n`);
};

export type CommandHandlerDefinition<T, U> = {
  command: string,
  description: string,
  builder?: ModuleBuilder<T>,
  setup: (argv: Argv<T>, instance: MinecraftInstance) => U | Promise<U>,
  render: (options: U) => string | Array<?string>,
  renderError?: ErrorRenderer,
};

export default function createCommandHandler<T: Object, U: Object>({
  setup,
  render,
  renderError,
  command,
  description,
  builder,
  ...rest
}: CommandHandlerDefinition<T, U>): ModuleObject<T> {
  async function handler(
    argv: Argv<T & { json: boolean }>,
    instance: MinecraftInstance,
  ): Promise<string | Array<?string>> {
    const result = await setup(argv, instance);

    if (argv.json) {
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
    builder,
    handler(argv: Argv<T> & { directory: string }) {
      const directory = resolvePath(argv.directory);
      const instance: MinecraftInstance = new MinecraftInstance(directory);

      tryHandler(argv, instance);
    },
  };
}
