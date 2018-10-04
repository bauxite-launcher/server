#!/usr/bin/node
// @flow

import yargs from 'yargs';

yargs.usage('$0 <cmd> [args]').options({
  directory: {
    type: 'string',
    global: true,
  },
});
