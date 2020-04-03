import * as ts from 'typescript'
import * as chalk from 'chalk'
import { pos2location, hasDiagRange, toRelativePath } from '../utils'
import { DiagnosticWithRange } from '../types'
import { lineMark, pad, lineMarkForUnderline } from './helper'

export class Reporter {
  report(msg: any) {
    console.log(msg)
  }

  reportDiagnosticsSummary(diagnostics: ts.Diagnostic[]) {
    if (!diagnostics.length) {
      this.report('✨  No type error found')
      return
    }

    let outputs: string[] = []
    const errors = diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error).length
    const warnings = diagnostics.filter(d => d.category === ts.DiagnosticCategory.Warning).length

    if (!!errors) outputs.push(`Found ${chalk.red(errors)} errors`)
    if (!!warnings) outputs.push(`Found ${chalk.yellow(warnings)} warnings`)

    const output = outputs.join('\n')
    this.report(output)
  }

  reportDiagnostics(diagnostics: ts.Diagnostic[]) {
    diagnostics.forEach(d => {
      if (hasDiagRange(d)) {
        this._reportDiagnosticWithRange(d)
      } else {
        this.report(d)
      }
    })
  }

  _reportDiagnosticWithRange(diagnostic: DiagnosticWithRange) {
    const { start, length, file, messageText } = diagnostic
    const content = file && file.getFullText()
    if (!content) return

    const relativeFileName = toRelativePath(file!.fileName)
    const startLC = pos2location(content, start)
    const endLC = pos2location(content, start + length)
    const fileIndicator = `${relativeFileName}:${startLC.line + 1}:${startLC.character + 1}`
    const message = typeof messageText === 'string' ? messageText : messageText.messageText
    const outputs = [`${fileIndicator} - ${message}`, '']
    const allLines = content.split('\n');
    const preLines = allLines.slice(Math.max(startLC.line - 1, 0), startLC.line);
    const lines = allLines.slice(startLC.line, endLC.line + 1);
    const postLines = allLines.slice(endLC.line + 1, Math.min(allLines.length - 1, endLC.line + 2));
    const lineMarkerWidth = (Math.min(allLines.length - 1, endLC.line + 2) + '').length;
    for (let i = 0; i < preLines.length; ++i) {
      outputs.push(lineMark(i + startLC.line - 1, lineMarkerWidth) + chalk.reset(preLines[i]));
    }
    for (let i = 0; i < lines.length; ++i) {
      outputs.push(lineMark(i + startLC.line, lineMarkerWidth) + lines[i]);
      if (i === 0) {
        if (startLC.line === endLC.line) {
          outputs.push(
            lineMarkForUnderline(lineMarkerWidth) +
              pad(' ', startLC.character) +
              chalk.red(pad('~', endLC.character - startLC.character)),
          );
        } else {
          outputs.push(
            lineMarkForUnderline(lineMarkerWidth) +
              pad(' ', startLC.character) +
              chalk.red(pad('~', lines[i].length - startLC.character)),
          );
        }
      } else if (i === lines.length - 1) {
        outputs.push(lineMarkForUnderline(lineMarkerWidth) + chalk.red(pad('~', endLC.character)));
      } else {
        outputs.push(lineMarkForUnderline(lineMarkerWidth) + chalk.red(pad('~', lines[i].length)));
      }
    }

    for (let i = 0; i < postLines.length; ++i) {
      outputs.push(lineMark(i + endLC.line + 1, lineMarkerWidth) + chalk.reset(postLines[i]));
    }
    outputs.push('');

    this.report(outputs.join('\n'))
  }
}
