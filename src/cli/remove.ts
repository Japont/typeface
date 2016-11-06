import * as path from 'path';
import ora = require('ora');
import { Argv as YargsArgv } from 'yargs';
import { CONST } from '../const';
import { Utils } from '../utils';

export const yargsCommand = {
  command: [
    'remove <packages...>',
    'rm',
    'delete',
    'del',
  ],
  describe: 'Remove packages',
  builder(yargs: YargsArgv): any {
    return yargs;
  },
  async handler(argv: any) {
    for (const packageName of <string[]> argv.packages) {
      const spinner = ora(`Removing ${packageName}`).start();
      await remove(packageName)
        .then((result) => {
          spinner.text = result.message;
          spinner.succeed();
        })
        .catch((err: Error) => {
          spinner.text = err.message;
          spinner.fail();
          return Promise.reject(err);
        });
    }
  },
};

export async function remove(packageName: string) {
  const packageDir = path.resolve(CONST.DEFAULT_FONTS_PATH, `./${packageName}`);

  if (! await Utils.exists(packageDir)) {
    return {
      status: 'skip',
      message: `Skipped ${packageName}: Not found`,
    };
  }
  await Utils.rimraf(packageDir);
  return {
    status: 'success',
    message: `Removed ${packageName}`,
  };
}
