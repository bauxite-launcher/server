// @flow
import { type Argv } from 'yargs';
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../commandHandler';
import responseParsers from '../rconResponseParsers';

type RconArgs = {
  command: string,
};

type RconOutput = {
  result: string,
  command: string,
  commandName: string,
  parsed: any,
};

export const rconCommand: CommandHandlerDefinition<RconArgs, RconOutput> = {
  command: 'rcon',
  description: 'Send a command to a running instance via rcon',
  builder: {
    command: {
      type: 'string',
    },
  },
  async setup({ command }: Argv<RconArgs>, instance): Promise<RconOutput> {
    const running = await instance.isRunning();
    if (!running) {
      throw new Error('The instance is not running');
    }

    const rawResult = await instance.rconCommand(command);
    const result = rawResult.split(/\r?\n/g).join('\n');
    const [commandName, ...rest] = command.split(/\s+/g);

    const responseParser = responseParsers[commandName];
    const parsed = responseParser && responseParser(result, commandName, rest);

    return {
      result,
      command,
      commandName,
      parsed,
    };
  },
  render({ result }) {
    return result;
  },
};

export default createCommandHandler(rconCommand);
