import Fuse = require('fuse.js');
import ora = require('ora');
import columns = require('cli-columns');
import { Argv as YargsArgv } from 'yargs';
import { Utils } from '../utils';

export const yargsCommand = {
  command: [
    'search <package>',
    'find',
  ],
  describe: 'Search package name',
  builder(yargs: YargsArgv): any {
    return yargs;
  },
  async handler(argv: any) {
    const spinner = ora(`Searching ${argv.package}`).start();
    await search(argv.package)
      .then((result) => {
        spinner.succeed();
        console.log(columns(result.results));
      })
      .catch((err: Error) => {
        spinner.text = err.message;
        spinner.fail();
        return Promise.reject(err);
      });
  },
};

export async function search(query: string) {
  const options = {
    id: 'path',
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    keys: [ 'path' ]
  };
  const fuse = new Fuse(await Utils.fetchAllPackageList(), options);
  const results = <string[]> fuse.search(query);

  return {
    status: 'success',
    results,
  };
}
