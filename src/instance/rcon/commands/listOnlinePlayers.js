// @flow

import createRconCommand from '../RconCommand';

export type ListOnlinePlayersResults = {};

export const listCommandRegex = /^There are (\d+) of a max (\d+) players online: (.*)$/;

export const listOnlinePlayers = {
  name: 'listOnlinePlayers',
  command() {
    return 'list';
  },
  response(response: string): ListOnlinePlayersResults {
    const matches = response.match(listCommandRegex);
    if (!matches) {
      throw new Error(
        `Could not read response from 'list' command. Expected something matching:\n\n\t/${
          listCommandRegex.source
        }/\n\n...but instead got:\n\n\t"${response}"`,
      );
    }

    const [, count, max, players] = matches;
    return {
      count: parseInt(count, 10),
      max: parseInt(max, 10),
      players: players.split(/,|(?:,?\s+)/g).filter(Boolean),
    };
  },
};

export default createRconCommand(listOnlinePlayers);
