import * as ts from 'typescript'
import { Location, DiagnosticWithRange } from '../types'

export const pos2location = (content: string, pos: number): Location => {
  let l = 0,
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

export const hasDiagRange = (diagnostic: ts.Diagnostic): diagnostic is DiagnosticWithRange => {
  const { start, length } = diagnostic
  return typeof start === 'number' && typeof length === 'number'
}

export const toRelativePath = (str: string) => str.replace(process.cwd() + '/', '')
