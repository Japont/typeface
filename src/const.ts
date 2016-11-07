import * as path from 'path';
import readPkgUp = require('read-pkg-up');

export const CONST = {
  BASE_INFO_URL: 'https://raw.githubusercontent.com/Japont/typeface-packages/master/',
  GITHUB_API_TREE_URL: 'https://api.github.com/repos/Japont/typeface-packages/git/trees/master',
  VERSION: readPkgUp.sync(__dirname).pkg.version,
  DEFAULT_FONTS_PATH: path.join(process.env['PWD'], './fonts/'),
};

Object.freeze(CONST);
