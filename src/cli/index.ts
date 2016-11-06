import * as yargs from 'yargs';
import { yargsCommand as add } from './add';

yargs
.command(<any> add.command, add.describe, add.builder, add.handler)
.demand(1)
.strict()
.help()
.argv;
