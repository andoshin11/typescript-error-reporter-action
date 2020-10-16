import * as _ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
import { createHost, createService } from './langSvc'
import { Reporter } from './reporter'
import { FileEntry } from './types'
import { getAllLibs, uniq } from './utils'

export class Doctor {
  private service: _ts.LanguageService
  public reporter: Reporter

  scriptVersions: FileEntry = new Map()

  constructor(public fileNames: string[], private config: _ts.ParsedCommandLine, ts: typeof _ts) {
    const host = createHost(fileNames, config, this.scriptVersions, ts)
    this.service = createService(host, ts)
    this.reporter = new Reporter(ts)
  }

  static fromConfigFile(configPath: string, ts: typeof _ts): Doctor {
    const content = fs.readFileSync(configPath).toString();
    const { config: json } = ts.parseConfigFileTextToJson(configPath, content)
    const config = ts.parseJsonConfigFileContent(
        json,
        ts.sys,
        path.dirname(configPath)
    );

    const defaultLibFileName = _ts.getDefaultLibFileName(config.options)
    const libs =  [defaultLibFileName, ...(config.options.lib || [])]
    const allLibs = getAllLibs(uniq(libs))

    /**
     * Note:
     * 
     * since we use CDN-hosted TS runtime, which is a bundled version,
     * we need to manually added lib.*.d.ts. 
     */
    const fileNames = [
      ...config.fileNames,
      ...allLibs
    ]

    return new Doctor(fileNames, config, ts)
  }

  getSemanticDiagnostics() {
    const { service } = this
    const result = service.getProgram()!.getSemanticDiagnostics()
    return [...result]
  }
}
