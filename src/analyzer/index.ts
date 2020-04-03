import * as ts from 'typescript'
import { code2symptom } from '../utils'
import { CodeFixAction } from '../types'

export class Analyzer {
  constructor(private service: ts.LanguageService) {}

  getAutoCodeFixes(diagnostics: ts.Diagnostic[]): CodeFixAction[] {
    const analyzeDiagnostic = this.analyzeDiagnostic.bind(this)
    // console.log(diagnostics[0])
    const result = diagnostics.map(analyzeDiagnostic)

    return []
  }

  analyzeDiagnostic(diagnostic: ts.Diagnostic) {
    const symptom = code2symptom(diagnostic.code)

    return {
      diagnostic,
      symptom
    }
  }
}
