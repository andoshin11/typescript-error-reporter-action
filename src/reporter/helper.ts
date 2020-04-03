import * as _ts from 'typescript'
import * as chalk from 'chalk'
import { Message } from '../types'
import { pos2location } from '../utils'

export const pad = (letter: string, length: number) => {
  const outs: string[] = [];
  for (let i = 0; i < length; i++) {
    outs.push(letter);
  }
  return outs.join('');
}

export const lineMark = (line: number, width: number) => {
  const strLine = line + 1 + '';
  return chalk.inverse(pad(' ', width - strLine.length) + strLine) + ' '
};

export const lineMarkForUnderline = (width: number) => {
  return chalk.inverse(pad(' ', width)) + ' ';
};

const category2command = (category: _ts.DiagnosticCategory, ts: typeof _ts): 'error' | 'warning' | undefined => {
  switch (category) {
    case ts.DiagnosticCategory.Error:
      return 'error'
    case ts.DiagnosticCategory.Warning:
      return 'warning'
    default:
      return undefined
  }
}

const getProperties = (diagnostic: _ts.Diagnostic): Message['properties'] => {
  const file = diagnostic.file && diagnostic.file.fileName
  if (!file) return {}

  const start = diagnostic.start
  if (!start) return { file }

  const content = diagnostic.file!.getFullText()
  const { line, character } = pos2location(content, start)
  return {
    file,
    line: line + '',
    col: character + ''
  }
}

export const diagnostic2message = (diagnostic: _ts.Diagnostic, ts: typeof _ts): Message | undefined => {
  const command = category2command(diagnostic.category, ts)
  if (!command) return undefined

  const properties = getProperties(diagnostic)

  return {
    command,
    properties,
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
  }
}
