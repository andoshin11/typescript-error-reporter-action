import * as ts from 'typescript'

export * from './codeFix'
export * from './symptoms'

export type Location = { line: number; character: number }

export type DiagnosticWithRange = Omit<ts.Diagnostic, 'start' | 'length'> & { start: NonNullable<ts.Diagnostic['start']>; length: NonNullable<ts.Diagnostic['length']> }

export type FileEntry = Map<string, { version: number; scriptSnapshot: ts.IScriptSnapshot }>
