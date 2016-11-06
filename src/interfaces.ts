export interface TypefaceInfo {
  name: string;
  authors: string[];
  website: string;
  source: string;
  files?: string[];
  license: {
    type: string;
    files: string[];
  },
  raw: string;
}
