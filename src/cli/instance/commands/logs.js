// @flow
import { type Argv } from 'yargs';
import parseDate from 'date-fns/parse';
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../../util/commandHandler';
import LogFile, { type LogEntry } from '../../../instance/files/LogFile';

const LogLevels = { ERROR: 1, INFO: 2, WARN: 3 };
type LogLevel = $Keys<typeof LogLevels>; // eslint-disable-line no-undef
type LogsArgs = {
  lines?: number,
  date?: Date,
  level?: LogLevel,
  tail?: boolean,
};
type LogsOutput =
  | {
      level: ?LogLevel,
      files: Array<{
        name: string,
        lines?: ?number,
        entries: Array<LogEntry>,
        level?: ?LogLevel,
      }>,
    }
  | { tail: true };

function renderLogItem({
  time, logLevel, category, text,
}) {
  return `[${time}] ${logLevel || 'INFO'} {${category.join('|')}} ─ ${text}`;
}

export const logsCommand: CommandHandlerDefinition<LogsArgs, LogsOutput> = {
  command: 'logs',
  description: 'Displays logs from the Minecraft server',
  builder: {
    lines: {
      type: 'number',
      conflicts: 'tail',
      description:
        'The number of lines to show. If omitted, all will be shown.',
    },
    date: {
      type: 'string',
      conflicts: 'tail',
      description:
        'The date from which to show the logs. If omitted, the latest will be shown.',
      coerce: (value: string): Date => parseDate(value),
    },
    level: {
      type: 'string',
      description: 'The minimum log level to show',
    },
    tail: {
      type: 'boolean',
      default: false,
    },
  },
  async setup(
    {
      lines, date, level, tail,
    }: Argv<LogsArgs>,
    instance,
  ): Promise<LogsOutput> {
    if (tail) {
      // Promise that never resolves, so that we continue until the user kills the process (with Ctrl+C)
      const latestLogFile = await instance.logs.getLatest();
      await new Promise((resolve, reject) => {
        latestLogFile.tail((line) => {
          console.log(renderLogItem(line));
        }, reject);
      });
    }
    const logFiles: Array<LogFile> = date
      ? await instance.logs.getByDate(date)
      : [await instance.logs.getLatest()];

    if (!logFiles.length) {
      return { level, files: [] };
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
        ...entries.map(renderLogItem),
      ])
      .reduce((acc, item) => acc.concat(item), []);
  },
};

export default createCommandHandler(logsCommand);
