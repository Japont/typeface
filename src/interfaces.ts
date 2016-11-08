export interface TypefaceInfo {
  name: string;
  authors: string[];
  website: string;
  sources: string[];
  files?: string[];
  license: {
    type: string;
    files: string[];
  },
  raw: string;
}

export interface TypefaceInfoRaw {
  name: string;
  authors: string[];
  website: string;
  sources: string | string[];
  files?: string[];
  license: {
    type: string;
    files: string[];
  },
  raw: string;
}
