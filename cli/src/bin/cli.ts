#!/usr/bin/env node
'use strict';

import * as commander from 'commander';
import { main } from '../lib/lib';
commander
  .description(`DNDLite character creator`)
  .parse(process.argv);
main(commander);
