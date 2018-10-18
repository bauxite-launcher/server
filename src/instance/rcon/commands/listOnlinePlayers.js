// @flow

import createRconCommand, { type RconCommandHandler } from '../RconCommand';

export type ListOnlinePlayersResults = {
  count: number,
  max: number,
  players: Array<string>,
};

export const listCommandFormat = /^There are (\d+) of a max (\d+) players online: (.*)$/;
export const playerNameSeparator = /,|(?:,?\s+)/g;

export const listOnlinePlayers = {
  name: 'listOnlinePlayers',
  command() {
    return 'list';
  },
  response(response: string): ListOnlinePlayersResults {
    const matches = response.match(listCommandFormat);
    if (!matches) {
      throw new Error(
        `Could not read response from 'list' command. Expected something matching:\n\n\t/${
          listCommandFormat.source
        }/\n\n...but instead got:\n\n\t"${response}"`,
      );
    }

    const [, count, max, players] = matches;
    return {
      count: parseInt(count, 10),
      max: parseInt(max, 10),
      players: players.split(playerNameSeparator).filter(Boolean),
    };
  },
};

const listOnlinePlayersCommand: RconCommandHandler<
  void,
  ListOnlinePlayersResults,
> = createRconCommand(listOnlinePlayers);

export default listOnlinePlayersCommand;
