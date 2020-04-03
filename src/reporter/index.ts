import * as _ts from 'typescript'
import * as chalk from 'chalk'
import { issueCommand } from '@actions/core/lib/command'
import { pos2location, nonNullable } from '../utils'
import { diagnostic2message } from './helper'

export class Reporter {
  constructor(private ts: typeof _ts) {}

  report(msg: any) {
    console.log(msg)
  }

  reportDiagnosticsSummary(diagnostics: _ts.Diagnostic[]) {
    if (!diagnostics.length) {
      this.report('✨  No type error found')
      return
    }

    let outputs: string[] = []
    const errors = diagnostics.filter(d => d.category === this.ts.DiagnosticCategory.Error).length
    const warnings = diagnostics.filter(d => d.category === this.ts.DiagnosticCategory.Warning).length

    if (!!errors) outputs.push(`Found ${chalk.red(errors)} errors`)
    if (!!warnings) outputs.push(`Found ${chalk.yellow(warnings)} warnings`)

    const output = outputs.join('\n')
    this.report(output)
  }

  reportDiagnostics(diagnostics: _ts.Diagnostic[]) {
    const ts = this.ts
    // Target only Error & Warning type
    const targetDiagnostics = diagnostics.filter(d => {
      return d.category === this.ts.DiagnosticCategory.Error || d.category === ts.DiagnosticCategory.Warning
    })

    const messages = targetDiagnostics.map(d => diagnostic2message(d, ts)).filter(nonNullable)
    console.log(messages)
    messages.forEach(({ command, properties, message }) => {
      // @ts-ignore
      // issueCommand(command, properties, message)
    })
  }
}
