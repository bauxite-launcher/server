#!/usr/bin/env node
// @flow

import yargs, { type ModuleObject } from 'yargs';
import {
  StatusCommand,
  InstallCommand,
  UpgradeCommand,
  StartCommand,
  StopCommand,
  LogsCommand,
} from './commands';

const commands: Array<ModuleObject<*>> = [
  StatusCommand,
  InstallCommand,
  UpgradeCommand,
  StartCommand,
  StopCommand,
  LogsCommand,
];

const argParser = yargs
  .options({
    directory: {
      type: 'string',
      global: true,
      default: process.cwd(),
      normalize: true,
      description: 'The directory of the Minecraft instance',
      defaultDescription: './',
    },
    json: {
      type: 'boolean',
      global: true,
      default: false,
      description: 'Output results as a JSON object',
    },
  })
  .env('BAUXITE')
  .demandCommand(1, '')
  .recommendCommands()
  .strict();

commands.reduce((acc, cmd) => acc.command(cmd), argParser).parse();
