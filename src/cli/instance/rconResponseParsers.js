export const listCommandFormatPre113 = /^There are (\d+) of a max (\d+) players online: (.*)$/;
export const listCommandFormatPost113 = /^There are (\d+)\/(\d+) players online:(?: )?(.*)$/;
export const playerNameSeparator = /,|(?:,?\s+)/g;

export default {
  list: (result) => {
    const matches = result.match(listCommandFormatPre113)
      || result.match(listCommandFormatPost113);
    if (!matches) {
      throw new Error(
        `Could not read result from 'list' command. Expected something matching:\n\n\t/${
          listCommandFormatPre113.source
        }/\n\n\tor\n\n\t${
          listCommandFormatPost113.source
        }\n\n...but instead got:\n\n\t"${result}"`,
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
