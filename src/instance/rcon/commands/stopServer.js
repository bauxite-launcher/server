// @flow

import createRconCommand, { type RconCommandHandler } from '../RconCommand';

export type StopServerResults = {
  stopping: boolean,
};

export const stopCommandResponse = /Stopping server/;

export const stopServer = {
  name: 'stopServer',
  command() {
    return 'stop';
  },
  response(response: string): StopServerResults {
    const matches = response.match(stopCommandResponse);
    if (!matches) {
      throw new Error(
        `Could not read response from 'stop' command. Expected something matching:\n\n\t/${
          stopCommandResponse.source
        }/\n\n...but instead got:\n\n\t"${response}"`,
      );
    }

    return { stopping: true };
  },
};

const stopServerCommand: RconCommandHandler<
  void,
  StopServerResults,
> = createRconCommand(stopServer);

export default stopServerCommand;
