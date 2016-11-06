import * as yargs from 'yargs';
import { yargsCommand as add } from './add';
import { yargsCommand as search } from './search';

yargs
.command(<any> add.command, add.describe, add.builder, add.handler)
.command(<any> search.command, search.describe, search.builder, search.handler)
.demand(1)
.strict()
.help()
.argv;
