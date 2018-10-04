#!/usr/bin/node
// @flow

import yargs from 'yargs';
import { InfoCommand } from './commands';

const commands = [InfoCommand];

commands.reduce((acc, cmd) => acc.command(cmd), yargs).parse();
