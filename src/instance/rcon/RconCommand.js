// @flow

export type RconRequest = string | Array<?(string | number | boolean | {})>;

export type RconMessageSender = (message: RconRequest) => Promise<string>;

export type RconCommandHandler<T, U> = (input: T) => Promise<U> | U;

export type RconCommandDefinition<T = *, U = *> = {
  name: string,
  +command: T => RconRequest,
  +response: string => U,
};

const createRconCommand = <T, U>({
  command: generateCommand,
  response: parseResponse,
}: RconCommandDefinition<T, U>): ((
  sendMessage: RconMessageSender,
) => RconCommandHandler<T, U>) => sendMessage => async (input) => {
    const request = generateCommand(input);
    const response = await sendMessage(request);
    return parseResponse(response);
  };

export default createRconCommand;
