import * as path from 'path';

export const CONST = {
  BASE_INFO_URL: 'https://raw.githubusercontent.com/Japont/typeface-packages/master/',
  GITHUB_API_TREE_URL: 'https://api.github.com/repos/Japont/typeface-packages/git/trees/master',
  VERSION: '0.0.0',
  DEFAULT_FONTS_PATH: path.join(process.env['PWD'], './fonts/'),
};

Object.freeze(CONST);
