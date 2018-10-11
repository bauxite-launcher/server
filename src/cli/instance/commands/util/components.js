// @flow
import chalk from 'chalk';
import { type StreamProgressEvent } from 'progress-stream';

export const definitionTerm = (term: ?string): string => (term ? chalk.white(`${term}:`) : '');

// $FlowIgnore -- dynamic colour without indexer in Chalk libdef
export const definitionValue = (value: ?string, colour: ?string = 'cyan') => (value ? chalk[colour](value) : '');

export const definitionList = (
  obj: { [key: string]: ?string },
  padding?: number = 3,
): string => {
  const longestKey = Object.keys(obj).reduce(
    (acc, curr) => (acc > curr.length ? acc : curr.length),
    0,
  );
  return Object.entries(obj)
    .map(
      ([term, value]) => (value
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

export const booleanValue = (value: boolean): string => (value ? chalk.green('Yes') : chalk.red('No'));

export const integerValue = (value: ?number): string => (typeof value === 'number' ? chalk.cyan(value.toString()) : '');

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

export const taskProgress = (
  action: string,
  progress: ?StreamProgressEvent,
): string => {
  if (!progress) return '';
  const {
    transferred, length, percentage, speed, eta,
  } = progress;
  return chalk.white(
    `\r ${chalk.gray('-')} Downloading ${fileSize(transferred)}/${fileSize(
      length,
    )} (${Math.round(percentage)}%) at ${fileSize(speed)}/s ─ ${timeDuration(
      eta,
    )} remaining…    `,
  );
};
