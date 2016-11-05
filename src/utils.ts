import Axios from 'axios';
import * as url from 'url';
import * as YAML from 'yamljs';
import * as mkdirp from 'mkdirp';
import fileType = require('file-type');
import * as fs from 'fs';
import * as pify from 'pify';
import { CONST } from './const';
import { TypefaceInfo } from './interfaces';

const axios = Axios.create({
  headers: {
    'User-Agent': `typeface/${CONST.VERSION}`,
  }
});

async function fetchPackageInfo(
  packageName: string,
) {
  const infoFileUrl = createInfoFileUrl(packageName);

  return <Promise<TypefaceInfo>> axios.request({
    url: infoFileUrl,
    responseType: 'text',
    transformResponse: [
      (data) => Object.assign(YAML.parse(data), { raw: data }),
    ],
  }).then(({ data }) => data);
}

async function fetchPackageSource(
  sourceUrl: string
) {
  return <Promise<Buffer>> axios.request({
    url: sourceUrl,
    responseType: 'arraybuffer',
    transformResponse: [
      (data) => Buffer.from(data),
    ],
  }).then(({ data }) => data);
}

function createInfoFileUrl(
  packageName: string,
) {
  return url.resolve(CONST.BASE_INFO_URL, `${packageName}/typeface.yml`);
}

async function mkdirpAsync(
  dir: string,
) {
  return <Promise<void>> pify(mkdirp)(dir);
}

async function writeFileAsync(
  filePath: string,
  data: any
) {
  return <Promise<void>> pify(fs.writeFile)(filePath, data);
}

function getFileType(
  buffer: Buffer,
): {
  ext: string,
  mime: string,
} {
  return fileType(buffer);
}

export const Utils = {
  fetchPackageInfo,
  fetchPackageSource,
  getFileType,
  mkdirp: mkdirpAsync,
  writeFile: writeFileAsync,
};
