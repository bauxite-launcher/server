#!/usr/bin/env node
// @flow

import yargs, { type ModuleObject } from 'yargs';
import { StatusCommand, InstallCommand } from './commands';

const commands: Array<ModuleObject<*>> = [StatusCommand, InstallCommand];

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
  .strict()
  .fail((msg, error) => {
    console.log(msg);
  });

commands.reduce((acc, cmd) => acc.command(cmd), argParser).parse();
