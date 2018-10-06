#!/usr/bin/env node
// @flow

import yargs from 'yargs';
import { InfoCommand } from './commands';

const commands = [InfoCommand];

const argParser = yargs
  .options({
    directory: {
      type: 'string',
      global: true,
      default: process.cwd(),
      normalize: true,
    },
  })
  .env('BAUXITE');

commands.reduce((acc, cmd) => acc.command(cmd), argParser).parse();
