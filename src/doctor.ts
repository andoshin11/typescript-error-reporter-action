import * as _ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
import { createHost, createService } from './langSvc'
import { Reporter } from './reporter'
import { FileEntry } from './types'

export class Doctor {
  private service: _ts.LanguageService
  public reporter: Reporter

  scriptVersions: FileEntry = new Map()

  constructor(public fileNames: string[], private compilerOptions: _ts.CompilerOptions, ts: typeof _ts) {
    const host = createHost(fileNames, compilerOptions, this.scriptVersions, ts)
    this.service = createService(host, ts)
    this.reporter = new Reporter(ts)
  }

  static fromConfigFile(configPath: string, ts: typeof _ts): Doctor {
    const content = fs.readFileSync(configPath).toString();
    const parsed = ts.parseJsonConfigFileContent(
        JSON.parse(content),
        ts.sys,
        path.dirname(configPath)
    );
    return new Doctor(parsed.fileNames, parsed.options, ts)
  }

  getSemanticDiagnostics() {
    const { service } = this
    const result = service.getProgram()!.getSemanticDiagnostics()
    return [...result]
  }
}
