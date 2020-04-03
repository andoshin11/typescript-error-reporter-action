import * as ts from 'typescript'

export * from './message'

export type Location = { line: number; character: number }

export type FileEntry = Map<string, { version: number; scriptSnapshot: ts.IScriptSnapshot }>
