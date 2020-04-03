import * as ts from 'typescript'
import * as chalk from 'chalk'
import { CodeFixAction } from '../types'
import { Reporter } from '../reporter'
import { toRelativePath } from '../utils'
import * as ast from '../ast'

export class Surgeon {
  constructor(
    private fileNames: string[],
    private reporter: Reporter,
    private service: ts.LanguageService
  ) {}

  /**
   * Notice:
   * 
   * all code fix action is dependent to character position.
   * due to the reason, only one code fix can be ran at a time for a file.
   */
  applyCodeFixActions(actions: CodeFixAction[]) {
    const byFile = actions.reduce((acc, ac) => {
      acc[ac.fileName] = ac
      return acc
    }, {} as Record<string, CodeFixAction>)

    const updatedSourceFiles = Object.values(byFile).map(this.applyCodeFixAction.bind(this))

    return {
      executed: Object.values(byFile),
      updatedSourceFiles
    }
  }

  applyCodeFixAction(action: CodeFixAction) {
    return this.applyChange(action)
  }

  applyChange(action: CodeFixAction) {
    const sourceFile = this.getSourceFile(action.fileName)

    this.reporter.report(`applying change on ${toRelativePath(sourceFile.fileName)}: ${chalk.yellowBright(action.description)}`)

    let updatedSourceFile = sourceFile

    if ('textChange' in action) {
      // FileTextChange
      updatedSourceFile = ast.changeText(sourceFile, action.textChange)
    }

    return updatedSourceFile
  }

  getSourceFile(fileName: string): ts.SourceFile {
    const program = this.service.getProgram()
    if (!program) {
      throw new Error('could not retrive TS program')
    }
    const file = program.getSourceFile(fileName)
    if (!file) {
      throw new Error(`could no find file: ${fileName}`)
    }

    return file
  }
}
