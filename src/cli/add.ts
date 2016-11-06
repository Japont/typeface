import * as path from 'path';
import * as mm from 'micromatch';
import { JSArchive, JSArchiveObject } from '../JSArchive';
import { Utils } from '../utils';
import { CONST } from '../const';

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

  if (opts.force !== true && Utils.exists(packageDir)) {
    console.warn(`${packageName} is already added.`);
    return;
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

  const sourceBuffer =
    await Utils.fetchPackageSource(packageInfo.source);
  const archive = <JSArchive> await JSArchive.loadAsync(sourceBuffer);

  await Utils.mkdirp(packageDir);
  await Utils.writeFile(
    path.resolve(packageDir, './typeface.yml'),
    packageInfo.raw,
  );
  await saveFiles(
    packageDir,
    [
      ...opts.fileGlobs,
      ...packageInfo.license.files,
    ],
    archive
  );
}

async function saveFiles(
  dirpath: string,
  filePathList: string[],
  archive: JSArchive,
) {
  const fileList: JSArchiveObject[] = [];

  for (const filePath of filePathList) {
    const glob = mm.expand(filePath);

    if (glob.tokens.is.glob) {
      const matchedFiles =
        <JSArchiveObject[]> archive.file(RegExp(glob.pattern));
      fileList.push(...matchedFiles);
    } else {
      const matchedFile = <JSArchiveObject> archive.file(filePath);
      fileList.push(matchedFile);
    }
  }

  for (const file of fileList) {
    const basename = path.basename(file.name);
    const filePath = path.resolve(dirpath, `./${basename}`);
    await Utils.writeFile(filePath, await file.async('nodebuffer'));
  }
}
