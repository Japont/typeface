import Fuse = require('fuse');
import { Utils } from '../utils';

export async function search(query: string) {
  const options = {
    id: 'path',
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    keys: [ 'path' ]
  };
  const fuse = new Fuse(await Utils.fetchAllPackageList(), options);
  const result = <string[]> fuse.search(query);

  return result;
}
