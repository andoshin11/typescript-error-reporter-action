import type { Diagnostic } from 'typescript'
import { issueCommand } from '@actions/core/lib/command'
type TS = typeof import('typescript')

export const reporter = (ts:TS) => (diagnostic:Diagnostic) => {
  switch (diagnostic.category) {
    case ts.DiagnosticCategory.Error: {
      return issueCommand('error', readProperties(diagnostic), ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
    }
    case ts.DiagnosticCategory.Warning: {
      return issueCommand('warning', readProperties(diagnostic), ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
    }
  }
}

export const readProperties = ({ start, file }:Diagnostic) => {
  const fileName = file && file.fileName
  if (!fileName) return {}
  if (!start) return { file: fileName }

  const content = file!.getFullText()
  const { line, column } = parseLocation(content, start)
  return { file: fileName, line: `${line}`, col: `${column}` }
}

export const parseLocation = (content:string, position:number) => {
  let l = 1
  let c = 0
  for (let i = 0; i < content.length && i < position; i++) {
    const cc = content[i]
    if (cc === '\n') {
      c = 0
      l++
    } else {
      c++
    }
  }

  return { line: l, column: c };
}
