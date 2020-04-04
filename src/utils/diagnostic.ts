import { Location } from '../types'

export const pos2location = (content: string, pos: number): Location => {
  let l = 1,
    c = 0;
  for (let i = 0; i < content.length && i < pos; i++) {
    const cc = content[i];
    if (cc === '\n') {
      c = 0;
      l++;
    } else {
      c++;
    }
  }
  return { line: l, character: c };
}

export const toRelativePath = (str: string) => str.replace(process.cwd() + '/', '')
