import pkg from '../../../../package.json';

export const command = 'version';
export const describe = 'Show the version';
// eslint-disable-next-line no-console
export const handler = () => console.log(`v${pkg.version}`);
