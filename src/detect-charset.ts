import * as jschardet from 'jschardet';

const REGEXP: { [key: string]: RegExp } = {
  'Shift_JIS': /^([\x00-\x7f]|[\xa1-\xdf]|[\x81-\x9f\xe0-\xef][\x40-\x7e\x80-\xfc])*$/,
  'EUC-JP': /^([\x00-\x7f]|[\xa1-\xfe][\xa1-\xfe]|\x8e[\xa1-\xdf]|\x8f[\xa1-\xfe][\xa1-\xfe])*$/,
  'CP51932': /^([\x00-\x7f]|[\xa1-\xfe][\xa1-\xfe]|\x8e[\xa1-\xdf])*$/,
  'ISO-2022-JP': /^([\x00-\x1a\x1c-\x7f]|\x1b\x24[\x40\x42]([\x21-\x7e][\x21-\x7e])+|\x1b\x24\x28[\x40\x42\x44]([\x21-\x7e][\x21-\x7e])+|\x1b\x28\x42)*$/,
  'UTF-8': /^([\x00-\x7f]|[\xc0-\xdf][\x80-\xbf]|[\xe0-\xef][\x80-\xbf]{2}|[\xf0-\xf7][\x80-\xbf]{3}|[\xf8-\xfb][\x80-\xbf]{4}|[\xfc-\xfd][\x80-\xbf]{5})*$/,
};

export function detectCharset(data: Buffer) {
  const text = Array.from(data).map((i) => String.fromCharCode(i)).join('');

  // Check RegExp
  for (const charset in REGEXP) {
    const regexp = REGEXP[charset];
    if (regexp.test(text)) {
      return charset;
    }
  }

  return <string> jschardet.detect(data).encoding || 'utf8';
}
