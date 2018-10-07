// @flow
import { type Argv } from 'yargs';
import parseDate from 'date-fns/parse';
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../../util/commandHandler';
import { type LogEntry } from '../../../instance/files/LogFile';

const LogLevels = { ERROR: 1, INFO: 2, WARN: 3 };
type LogLevel = $Keys<typeof LogLevels>; // eslint-disable-line no-undef
type LogsArgs = { lines?: number, date?: Date, level: LogLevel };
type LogsOutput = {
  level: ?LogLevel,
  files: Array<{
    name: string,
    lines?: ?number,
    entries: Array<LogEntry>,
    level?: ?LogLevel,
  }>,
};

export const logsCommand: CommandHandlerDefinition<LogsArgs, LogsOutput> = {
  command: 'logs',
  description: 'Logs Minecraft server',
  builder: {
    lines: {
      type: 'number',
      description:
        'The number of lines to show. If omitted, all will be shown.',
    },
    date: {
      type: 'string',
      description:
        'The date from which to show the logs. If omitted, the latest will be shown.',
      coerce: (value: string): Date => parseDate(value),
    },
    level: {
      type: 'string',
      description: 'The minimum log level to show',
    },
  },
  async setup(
    { lines, date, level }: Argv<LogsArgs>,
    instance,
  ): Promise<LogsOutput> {
    const logFiles = date
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
  render({ files: logFiles }) {
    if (!logFiles.length) {
      return 'No log files found.';
    }
    return logFiles
      .map(({ name, lines, entries }) => [
        `\n--[${
          lines ? `Last ${lines} entries from` : 'All entries from'
        } ${name}]--`,
        ...entries.map(
          ({
            time, logLevel, category, text,
          }) => `[${time}] ${logLevel || 'INFO'} {${category.join('|')}} ─ ${text}`,
        ),
      ])
      .reduce((acc, item) => acc.concat(item), []);
  },
};

export default createCommandHandler(logsCommand);
