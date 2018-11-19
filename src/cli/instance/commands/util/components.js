// @flow
import chalk from 'chalk';
import { type StreamProgressEvent } from 'progress-stream';
import { WriteStream as TtyWriteStream } from 'tty';

type ValueType = string | boolean | number | null;

// $FlowIgnore ─ no indexer in chalk libdef
export const booleanValue = (value: boolean, colour?: ?string): string => (value
  ? chalk.keyword(colour || 'green')('Yes')
  : chalk.keyword(colour || 'red')('No'));

// $FlowIgnore ─ no indexer in chalk libdef
export const integerValue = (value: ?number, colour?: ?string): string => (typeof value === 'number'
  ? chalk.keyword(colour || 'yellow')(value.toString())
  : '');

export const definitionTerm = (term: ?string): string => (term ? chalk.white(`${term}:`) : '');

export const definitionValue = (value: ValueType, colour?: string) => {
  switch (typeof value) {
    case 'boolean':
      return booleanValue(value, colour);
    case 'number':
      return integerValue(value, colour);
    default:
      return value ? chalk.keyword(colour || 'cyan')(value.toString()) : '';
  }
};

export const definitionList = (
  obj: { [key: string]: ValueType },
  padding?: number = 3,
): string => {
  const longestKey = Object.keys(obj).reduce(
    (acc, curr) => (acc > curr.length ? acc : curr.length),
    0,
  );
  return Object.keys(obj)
    .map(key => [key, obj[key]])
    .map(
      ([term, value]) => (term
        ? [definitionTerm(term), definitionValue(value)].join(
          Array(padding + longestKey - term.length)
            .fill(' ')
            .join(''),
        )
        : null),
    )
    .filter(Boolean)
    .join('\n');
};

export const timeDuration = (seconds?: ?number = 0): string => {
  if (typeof seconds !== 'number') {
    return '';
  }
  const minutes = Math.floor(seconds / 60);
  const remSeconds = seconds - minutes * 60;
  if (minutes) {
    return `${minutes}m ${remSeconds.toString().padStart(2, '0')}s`;
  }
  return `${remSeconds}s`;
};

const fileSizeUnits = ['B', 'kB', 'MB', 'GB'];
export const fileSize = (size: number): string => {
  let output = size;
  let unitIndex = 0;
  while (output > 1000 && unitIndex < fileSizeUnits.length) {
    output /= 1024;
    unitIndex += 1;
  }
  return `${Math.round(output)}${fileSizeUnits[unitIndex]}`;
};

let taskAnimIndex = 0;
const taskAnimParts = [
  '🕛',
  '🕐',
  '🕑',
  '🕒',
  '🕓',
  '🕔',
  '🕕',
  '🕖',
  '🕗',
  '🕘',
  '🕙',
  '🕚',
];
export const taskProgress = (
  action: string,
  progress: ?StreamProgressEvent,
): string => {
  let progressText = '…';
  if (progress) {
    const {
      transferred, length, percentage, speed, eta,
    } = progress;
    progressText = ` ${fileSize(transferred)}/${fileSize(length)} (${Math.round(
      percentage,
    )}%) at ${fileSize(speed)}/s ─ ${timeDuration(eta)} remaining…`;
  }

  const isComplete = progress && progress.transferred === progress.length;

  if (progress && !isComplete) {
    taskAnimIndex = (taskAnimIndex + 1) % taskAnimParts.length;
  }

  const symbol = isComplete
    ? chalk.green(' ✔️ ')
    : chalk.blue(` ${taskAnimParts[taskAnimIndex]} `);

  const columns = process.stdout instanceof TtyWriteStream ? process.stdout.columns : 80;
  return chalk.white(
    `\r ${symbol} ${action}${progressText}`.padEnd(columns, ' '),
  );
};
