import * as yargs from 'yargs';
import readPkgUp = require('read-pkg-up');
import * as updateNotifier from 'update-notifier';
import { yargsCommand as add } from './add';
import { yargsCommand as remove } from './remove';
import { yargsCommand as search } from './search';

updateNotifier(readPkgUp.sync(__dirname)).notify();

yargs
.command(<any> add.command, add.describe, add.builder, add.handler)
.command(<any> remove.command, remove.describe, remove.builder, remove.handler)
.command(<any> search.command, search.describe, search.builder, search.handler)
.demand(1)
.strict()
.help()
.argv;
