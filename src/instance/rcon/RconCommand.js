// @flow

export type RconRequest = string | Array<?(string | number | boolean | Object)>;

export type RconMessageSender = (
  message: RconRequest,
) => Promise<string> | string;

export type RconCommandHandler<T = *, U = *> = ((
  input: T,
  sendMessage: RconMessageSender,
) => Promise<U> | U) & { commandName: string };

export type RconCommandDefinition<T = *, U = *> = {
  name: string,
  +command: T => RconRequest,
  +response: string => U,
};

function createRconCommand<T, U>({
  name,
  command: generateCommand,
  response: parseResponse,
}: RconCommandDefinition<T, U>): RconCommandHandler<T, U> {
  async function commandHandler(input, sendMessage: RconMessageSender) {
    const request = generateCommand(input);
    const response = await sendMessage(request);
    return parseResponse(response);
  }
  commandHandler.commandName = name;
  // $FlowIgnore -- intersection type not working as expected :/
  return commandHandler;
}

export default createRconCommand;
