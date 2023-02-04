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
    const compilerOptions = parsed.options

    const defaultLibFileName = _ts.getDefaultLibFileName(compilerOptions)
    const libs =  [defaultLibFileName, ...(compilerOptions.lib || [])]
    const allLibs = getAllLibs(uniq(libs))

    /**
     * Note: somehow, `types` option inside tsconfig.json is ignored.
     */
    const { typeRoots, types } = compilerOptions
    const _typeRoots = [path.resolve(path.dirname(configPath), './node_modules/@types'), path.resolve(path.dirname(configPath), './node_modules'), ...(typeRoots || [])]
    let typesFiles = (types || []).map(t => {
      for (const typeRoot of _typeRoots) {
        const modulePath = path.resolve(typeRoot, t)
        if (fs.existsSync(modulePath)) {
          const entrypoint = JSON.parse(fs.readFileSync(path.resolve(modulePath, 'package.json'), 'utf-8'))['types']
          const entrypointPath = path.resolve(modulePath, entrypoint)
          if (fs.existsSync(entrypointPath)) {
            return entrypointPath
          }
        }
      }

      return null
    }).filter(Boolean) as string[]


    /**
     * Note:
     * 
     * since we use CDN-hosted TS runtime, which is a bundled version,
     * we need to manually added lib.*.d.ts. 
     */
    const fileNames = [
      ...parsed.fileNames,
      ...allLibs,
      ...typesFiles
    ]

    return new Doctor(fileNames, compilerOptions, ts)
  }

  getSemanticDiagnostics() {
    const { service } = this
    const result = service.getProgram()!.getSemanticDiagnostics()
    return [...result]
  }
}
