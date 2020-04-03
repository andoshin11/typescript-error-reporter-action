import * as ts from 'typescript'
import { CodeFixAction } from '../types'
import { flatten } from '../utils'

/**
 * Notice:
 *
 * type-doctor accepts only one code change at a time for a file
 * due to the character position dependent architecture.
 */
export const toCodeFixActions = (input: readonly ts.CodeFixAction[]): CodeFixAction[] => {
  function transform(codeFixes: ts.CodeFixAction): CodeFixAction[] {
    const { fixName, description, changes } = codeFixes

    const result = changes.map(change => {
      const res: CodeFixAction[] = change.textChanges.map(textChange => ({
        fileName: change.fileName,
        fixName,
        description,
        textChange
      }))
      return res
    })

    return flatten(result)
  }

  const result = [...input].map(transform)
  return flatten(result)
}
