import * as JSZip from 'jszip';
import * as lzma from 'lzma-native';
import * as tar from 'tar-stream';
import { WritableStreamBuffer } from 'stream-buffers';
import { Utils } from '../utils';

export class JSArchive {
  public files: { [key: string]: JSArchiveObject } = {};
  public comment: string = '';
  private data: Buffer;

  constructor() {}

  file(name: string | RegExp): JSArchiveObject | JSArchiveObject[] {
    if (typeof name === 'string') {
      const file = this.files[name];
      if (file) {
        return file;
      } else {
        throw new Error(`Not found: ${name}`);
      }
    } else {
      const files: JSArchiveObject[] = [];
      for (const fileName in this.files) {
        if (name.test(fileName)) {
          files.push(this.files[fileName]);
        }
      }
      return files;
    }
  }

  static async loadAsync(data: Buffer, opts: any = {}) {
    return new JSArchive().loadAsync(data, opts);
  }

  async loadAsync(data: Buffer, opts: any = {}): Promise<JSZip | JSArchive> {
    this.data = data;
    const fileType = Utils.getFileType(this.data);

    switch (fileType.ext) {
      case 'zip': {
        const jsZipOpts = Object.assign({}, opts, {
          decodeFileName(bytes: Uint8Array) {
            return Utils.encodeAnyToUTF8(bytes);
          },
        });
        return new JSZip().loadAsync(this.data, jsZipOpts);
      }

      case 'tar': {
        await new Promise((resolve) => {
          const extract = tar.extract();
          extract.on('entry', (
            info: any,
            stream: NodeJS.ReadableStream,
            done: Function,
          ) => {
            info.stream = stream;
            if (info.type === 'file' || info.type === 'directory') {
              this.files[info.name] = new JSArchiveObject(info);
            }
            done();
          });
          extract.on('finish', resolve);
          extract.end(this.data);
        });
        return this;
      }

      case 'xz': {
        const tarBuffer = await lzma.decompress(this.data);
        return this.loadAsync(tarBuffer, opts);
      }

      default: {
        throw new Error(`Unsupported Type: ${fileType.ext}`);
      }
    }
  }
}

export class JSArchiveObject {
  public name: string;
  public dir: boolean;
  public date: Date;
  public unixPermission: number;
  private stream: NodeJS.ReadableStream;
  private data: Buffer;

  constructor(info: any) {
    this.name = info.name;
    this.dir = (info.type === 'directory');
    this.date = info.mtime;
    this.unixPermission = info.mode;
    this.stream = info.stream;
  }

  async async(type: string) {
    if (this.data) {
      return this.data;
    }
    const buffer =
      await <Promise<Buffer>> new Promise((resolve) => {
        const writableStream = <any> new WritableStreamBuffer();
        this.stream.on('end', () => {
          this.data = writableStream.getContents();
          resolve(this.data);
        });
        this.stream.pipe(writableStream);
        this.stream.resume();
      });

    if (type === 'nodebuffer') {
      return buffer;
    } else {
      throw new Error(`Unsupported type: ${type}`);
    }
  }
}
