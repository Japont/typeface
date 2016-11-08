import Axios from 'axios';
import * as url from 'url';
import * as YAML from 'yamljs';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';
import fileType = require('file-type');
import * as fs from 'fs';
import * as pify from 'pify';
import * as iconv from 'iconv-lite';
import { detectCharset } from './detect-charset';
import { CONST } from './const';
import { TypefaceInfo, TypefaceInfoRaw } from './interfaces';

const axios = Axios.create({
  headers: {
    'User-Agent': `typeface/${CONST.VERSION}`,
  },
  timeout: 3000,
});

async function fetchAllPackageList() {
  return <Promise<string[]>> axios.request({
    url: CONST.GITHUB_API_TREE_URL,
    responseType: 'json',
    transformResponse: [
      (data) => JSON.parse(data),
      (data) => data.tree,
      (data) => data.filter((i: any) => i.type === 'tree'),
    ],
  }).then(({ data }) => data);
}

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
  }).then(({ data }: { data: TypefaceInfoRaw}) => {
    if (!Array.isArray(data.sources)) {
      data.sources = [ data.sources ];
    }
    return <TypefaceInfo> data;
  });
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

async function rimrafAsync(
  dir: string,
) {
  return <Promise<void>> pify(rimraf)(dir);
}

async function writeFileAsync(
  filePath: string,
  data: any
) {
  return <Promise<void>> pify(fs.writeFile)(filePath, data);
}

async function existsAsync(
  filePath: string,
) {
  return <Promise<boolean>> pify(fs.stat)(filePath)
    .then(() => Promise.resolve(true)).catch(() => Promise.resolve(false));
}

function getFileType(
  buffer: Buffer,
): {
  ext: string,
  mime: string,
} {
  return fileType(buffer);
}

function isArchiveFile(
  buffer: Buffer,
) {
  const fileType = getFileType(buffer);
  return CONST.ARCHIVE_EXTS.includes(fileType.ext);
}

function encodeAnyToUTF8(bytes: any) {
  const buffer = Buffer.from(bytes);
  const charset = detectCharset(buffer);
  return iconv.decode(buffer, charset);
}

export const Utils = {
  fetchAllPackageList,
  fetchPackageInfo,
  fetchPackageSource,
  getFileType,
  isArchiveFile,
  encodeAnyToUTF8,
  mkdirp: mkdirpAsync,
  rimraf: rimrafAsync,
  writeFile: writeFileAsync,
  exists: existsAsync,
};
