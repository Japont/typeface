import * as path from 'path';
import * as mm from 'micromatch';
import ora = require('ora');
import { Argv as YargsArgv } from 'yargs';
import { JSArchive, JSArchiveObject } from '../JSArchive';
import { Utils } from '../utils';
import { CONST } from '../const';

export const yargsCommand = {
  command: [
    'add <packages...>',
    'download',
    'install',
  ],
  describe: 'Download fonts from packages',
  builder(yargs: YargsArgv): any {
    return yargs
      .option('files', {
        type: 'array',
        describe: 'Select files to download from package.',
      });
  },
  async handler(argv: any) {
    for (const packageName of <string[]> argv.packages) {
      const spinner = ora(`Downloading ${packageName}`).start();
      await add(packageName)
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

export interface TypefaceCLIAddOptions {
  fileGlobs?: string[];
  addAll?: boolean;
  force?: boolean;
}

export async function add (
  packageName: string,
  opts: TypefaceCLIAddOptions = <TypefaceCLIAddOptions>{},
) {
  const packageDir = path.resolve(CONST.DEFAULT_FONTS_PATH, `./${packageName}/`);

  if (opts.force !== true && await Utils.exists(packageDir)) {
    return {
      status: 'skip',
      message: `Skipped ${packageName}: Already exists`,
    };
  }

  const packageInfo = await Utils.fetchPackageInfo(packageName);

  if (!Array.isArray(opts.fileGlobs)) {
    if (opts.addAll !== false) {
      if (packageInfo.files) {
        opts.fileGlobs = packageInfo.files;
      } else {
        opts.fileGlobs = ['**/*.{ttf,otf,woff,woff2}'];
      }
    } else {
      opts.fileGlobs = [];
    }
  }

  for (const source of packageInfo.sources) {
    const sourceBuffer =
      await Utils.fetchPackageSource(source);

    if (! Utils.isArchiveFile(sourceBuffer)) {
      const basename = path.basename(source);
      const filePath = path.resolve(packageDir, `./${basename}`);
      await Utils.writeFile(filePath, sourceBuffer);
      continue;
    }

    const archive = <JSArchive> await JSArchive.loadAsync(sourceBuffer);

    await Utils.mkdirp(packageDir);
    // Save typeface.yml
    await Utils.writeFile(
      path.resolve(packageDir, './typeface.yml'),
      packageInfo.raw,
    );
    // Extract Font files
    await saveFiles(
      packageDir,
      opts.fileGlobs,
      archive,
    );
    // Extract LICENSE files
    await saveFiles(
      packageDir,
      packageInfo.license.files,
      archive,
      true,
    );
  }

  return {
    status: 'success',
    message: `Downloaded ${packageName}`,
  };
}

async function saveFiles(
  dirpath: string,
  filePathList: string[],
  archive: JSArchive,
  isTextFile: boolean = false,
) {
  const fileList: JSArchiveObject[] = [];

  for (const filePath of filePathList) {
    const globRegExp = new RegExp(mm.makeRe(filePath));
    const matchedFiles =
      <JSArchiveObject[]> archive.file(globRegExp);
    fileList.push(...matchedFiles);
  }

  for (const file of fileList) {
    const basename = path.basename(file.name);
    const filePath = path.resolve(dirpath, `./${basename}`);
    const buffer = await file.async('nodebuffer');
    if (isTextFile) {
      await Utils.writeFile(filePath, Utils.encodeAnyToUTF8(buffer));
    } else {
      await Utils.writeFile(filePath, buffer);
    }
  }
}
