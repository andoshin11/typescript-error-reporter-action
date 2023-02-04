import * as _ts from 'typescript'
import { issueCommand } from '@actions/core/lib/command'
import { nonNullable } from '../utils'
import { diagnostic2message } from './helper'

export class Reporter {
  constructor(private ts: typeof _ts) {}

  reportDiagnostics(diagnostics: _ts.Diagnostic[]) {
    const ts = this.ts
    // Target only Error & Warning type
    const targetDiagnostics = diagnostics.filter(d => {
      return d.category === this.ts.DiagnosticCategory.Error || d.category === ts.DiagnosticCategory.Warning
    })

    const messages = targetDiagnostics.map(d => diagnostic2message(d, ts)).filter(nonNullable)
    messages.forEach(({ command, properties, message }) => {
      issueCommand(command, properties, message)
    })
  }
}
