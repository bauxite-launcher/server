// @flow
import { type Argv } from 'yargs';
import parseDate from 'date-fns/parse';
import chalk from 'chalk';
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../commandHandler';
import LogFile, { type LogEntry } from '../../../instance/files/LogFile';

const LogLevels = { ERROR: 1, INFO: 2, WARN: 3 };
type LogLevel = $Keys<typeof LogLevels>; // eslint-disable-line no-undef
type LogsArgs = {
  lines?: number,
  date?: Date,
  level?: LogLevel,
  tail?: boolean,
  emoji?: boolean,
};
type LogsOutput =
  | {
      level: ?LogLevel,
      emoji: boolean,
      files: Array<{
        name: string,
        lines?: ?number,
        entries: Array<LogEntry>,
        level?: ?LogLevel,
      }>,
    }
  | { tail: true };

const logLevelEmojis = {
  INFO: 'ℹ️',
  WARN: '⚠️',
  ERROR: '💢',
};

const logLevelColours = {
  INFO: 'cyan',
  WARN: 'yellow',
  ERROR: 'red',
};

function renderLogItem({
  time, thread, logLevel, category, text,
}, { emoji }) {
  // $FlowIgnore -- no indexer within chalk, but only using explicit keys
  return chalk.keyword(logLevelColours[logLevel || 'INFO'] || 'gray')(
    emoji
      ? `[${time}] ${logLevelEmojis[logLevel || 'INFO']
          || '❓'} (${thread}) ${category
        .map(cat => `{${cat}}`)
        .join(' ')}  ${chalk.white(text)}`
      : `[${time}] ${logLevel || 'INFO'} (${thread}) ${
        category.length ? `{${category.join('|')}} ` : ''
      }─ ${chalk.white(text)}`,
  );
}

export const logsCommand: CommandHandlerDefinition<LogsArgs, LogsOutput> = {
  command: 'logs',
  description: 'Displays logs from the Minecraft server',
  builder: yargs => yargs
    .options({
      lines: {
        type: 'number',
        description:
            'The number of lines to show. If omitted, all will be shown.',
      },
      date: {
        type: 'string',
        description:
            'The date from which to show the logs. If omitted, the latest will be shown.',
        coerce: parseDate,
      },
      level: {
        type: 'string',
        description: 'The minimum log level to show',
      },
      tail: {
        type: 'boolean',
        description: 'Provide a live stream from the log file',
      },
      emoji: {
        type: 'boolean',
        description: 'Use emojis in output',
        default: true,
      },
    })
    .conflicts({
      tail: ['json', 'lines', 'date'],
    }),
  async setup(
    {
      lines, date, level, tail, emoji = true,
    }: Argv<LogsArgs>,
    instance,
  ): Promise<LogsOutput> {
    if (tail) {
      // Promise that never resolves, so that we continue until the user kills the process (with Ctrl+C)
      const latestLogFile = await instance.logs.getLatest();
      await new Promise((resolve, reject) => {
        latestLogFile.tail(
          line => console.log(renderLogItem(line, { emoji })),
          reject,
        );
      });
    }
    const logFiles: Array<LogFile> = date
      ? await instance.logs.getByDate(date)
      : [await instance.logs.getLatest()];

    if (!logFiles.length) {
      return { level, emoji, files: [] };
    }
    const logContent = await Promise.all(
      logFiles.map(async file => ({
        name: file.name,
        lines,
        entries: lines ? await file.readLast(lines) : await file.read(),
      })),
    );
    return {
      level,
      emoji: emoji || false,
      files: logContent.map(
        ({
          entries,
          ...rest
        }: {
          entries: Array<LogEntry>,
          name: string,
          lines: ?number,
        }) => ({
          ...rest,
          entries: entries.filter(
            ({ logLevel }) => LogLevels[logLevel || 'INFO'] >= LogLevels[level || 'INFO'],
          ),
        }),
      ),
    };
  },

  // Not destructuring result here, because Flow is a bit finnickity, and needs the
  // different branches of the intersection type to be obviously pointed out to it.
  render(result) {
    if (result.tail) {
      // When exiting from tail mode, all of our rendering has already been done
      return '';
    }

    if (!result.files.length) {
      return 'No log files found.';
    }

    return result.files
      .map(({ name, lines, entries }) => [
        `\n--[${
          lines ? `Last ${lines} entries from` : 'All entries from'
        } ${name}]--`,
        ...entries.map(line => renderLogItem(line, { emoji: result.emoji })),
      ])
      .reduce((acc, item) => acc.concat(item), []);
  },
};

export default createCommandHandler(logsCommand);
