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
  PropertiesCommand,
  ListModsCommand,
  InstallModCommand,
} from './commands';

const commands: Array<ModuleObject<*>> = [
  StatusCommand,
  InstallCommand,
  UpgradeCommand,
  StartCommand,
  StopCommand,
  LogsCommand,
  PropertiesCommand,
  ListModsCommand,
  InstallModCommand,
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
      description: 'Output results as a JSON object',
    },
    color: {
      type: 'boolean',
      global: true,
      description: 'Whether to use colours in the output',
      default: true,
      alias: ['colour'],
    },
  })
  .env('BAUXITE')
  .demandCommand(1, '')
  .recommendCommands()
  .strict();

commands.reduce((acc, cmd) => acc.command(cmd), argParser).parse();
