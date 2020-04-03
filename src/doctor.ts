import * as ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
import * as chalk from 'chalk'
import { createHost, createService, getTypesDts } from './langSvc'
import { Reporter } from './reporter'
import { Analyzer } from './analyzer'
import { Surgeon } from './surgeon'
import { hasDiagRange, nonNullable, toCodeFixActions } from './utils'
import { CodeFixAction, FileEntry } from './types'

export class Doctor {
  private service: ts.LanguageService
  public reporter: Reporter
  private analyzer: Analyzer
  private surgeon: Surgeon

  scriptVersions: FileEntry = new Map()

  constructor(public fileNames: string[], private compilerOptions: ts.CompilerOptions, private debug: boolean = false) {
    const host = createHost(fileNames, compilerOptions, this.scriptVersions)
    this.service = createService(host)
    this.reporter = new Reporter()
    this.analyzer = new Analyzer(this.service)
    this.surgeon = new Surgeon(fileNames, this.reporter, this.service)
  }

  static fromConfigFile(configPath: string, debug: boolean = false): Doctor {
    const content = fs.readFileSync(configPath).toString();
    const parsed = ts.parseJsonConfigFileContent(
        JSON.parse(content),
        ts.sys,
        path.dirname(configPath)
    );
    const rootFileNames = [
      ...parsed.fileNames
    ]
    return new Doctor(rootFileNames, parsed.options, debug)
  }

  getSemanticDiagnostics() {
    const { fileNames, service } = this
    const result = service.getProgram()!.getSemanticDiagnostics()
    // console.log(result)
    return [...result]
    // const result = fileNames.reduce((acc, ac) => {
    //   console.log('L49')
    //   console.log(ac)
    //   acc = [...acc, ...service.getSemanticDiagnostics(ac)]
    //   return acc
    // }, [] as ts.Diagnostic[])
    // return result
    return []
  }

  getTSNativeCodeFixes(diagnostics: ts.Diagnostic[]): CodeFixAction[] {
    const service = this.service
    const _diagnostics = diagnostics.filter(hasDiagRange)
    const codeFixesList = _diagnostics.map(d => {
      const { file, start, length, code } = d
      if (!file) return undefined
      return service.getCodeFixesAtPosition(file.fileName, start, start + length, [code], {}, {})
    }).filter(nonNullable)
    const codeFixes = codeFixesList.reduce((acc, ac) => {
      acc = [...acc, ...ac,]
      return acc
    }, [] as readonly ts.CodeFixAction[])

    return toCodeFixActions(codeFixes)
  }

  getAutoCodeFixes(diagnostics: ts.Diagnostic[]): CodeFixAction[] {
    const tsNativeCodeFixes = this.getTSNativeCodeFixes(diagnostics)
    const autoCodeFixes = this.analyzer.getAutoCodeFixes(diagnostics)

    return [
      ...tsNativeCodeFixes,
      ...autoCodeFixes
    ]
  }

  runDiagnostics() {
    const diagnostics = this.getSemanticDiagnostics()

    this.reporter.reportDiagnostics(diagnostics)
    this.reporter.reportDiagnosticsSummary(diagnostics)

    return {
      diagnostics
    }
  }

  // set virtual file
  updateVirtualFile(sourceFile: ts.SourceFile) {
    const { fileName } = sourceFile
    const scriptSnapshot = ts.ScriptSnapshot.fromString(sourceFile.getFullText())
    const currentScriptVersion = this.scriptVersions.get(fileName)!.version
    this.scriptVersions.set(fileName, { version: currentScriptVersion + 1, scriptSnapshot })
  }

  analyzeDiagnostics(diagnostics: ts.Diagnostic[]) {
    // TODO
    // this.analyzer.analyzeDiagnostics(diagnostics)
  }

  /**
   * Warning: cpu heavy
   *
   * apply all auto code fixes until no item's available
   */
  applyAutoCodeFixActions() {
    const getSemanticDiagnostics = this.getSemanticDiagnostics.bind(this)
    const getAutoCodeFixes = this.getAutoCodeFixes.bind(this)
    const surgeon = this.surgeon
    const updateVirtualFile = this.updateVirtualFile.bind(this)

    function run() {
      const diagnostics = getSemanticDiagnostics()
      const autoCodeFixes = getAutoCodeFixes(diagnostics)
      if (!autoCodeFixes.length) return
      const { updatedSourceFiles } = surgeon.applyCodeFixActions(autoCodeFixes)
      updatedSourceFiles.forEach(updateVirtualFile)
      run()
    }

    run()
    this.emitUpdatedFiles()
  }

  emitUpdatedFiles() {
    const { scriptVersions, writeFile } = this

    // check updated files
    const updatedFiles = Array.from(scriptVersions.keys())
      .filter(key => scriptVersions.get(key)!.version >= 1)

    // emit
    updatedFiles.forEach(fileName => {
      const scriptSnapshot = scriptVersions.get(fileName)!.scriptSnapshot
      const content = scriptSnapshot.getText(0, scriptSnapshot.getLength())
      writeFile(fileName, content)
    })

    // report
    const unit = updatedFiles.length > 1 ? 'files' : 'file'
    this.reporter.report(`✨ Fixed ${chalk.blue(updatedFiles.length)} ${unit} ✨`)
  }

  writeFile(fileName: string, content: string) {
    fs.writeFileSync(fileName, content)
  }
}
