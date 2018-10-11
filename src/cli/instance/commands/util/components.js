// @flow
import chalk from 'chalk';

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
