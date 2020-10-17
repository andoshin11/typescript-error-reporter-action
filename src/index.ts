import Module from 'module'
import * as path from 'path'
import * as fs from 'fs'
import { Diagnostic, DiagnosticCategory, textSpanContainsPosition } from 'typescript'
import { getInput, setFailed } from '@actions/core'
import { reporter } from './reporter'
import type { CompilerOptions, ParsedCommandLine } from "typescript"

type TS = typeof import('typescript')

async function main() {
  try {
    const project = getInput('project') || 'tsconfig.json'

    const projectPath = resolveProjectPath(path.resolve(process.cwd(), project))

    if (projectPath == null) {
      throw new Error(`No valid typescript project was not found at: ${projectPath}`)
    }

    typecheck(projectPath)
  } catch (e) {
    console.error(e)
    setFailed(e)
  }
}

/**
 * Attempts to resolve ts config file and returns either path to it or `null`.
 */
const resolveProjectPath = (projectPath:string) => {
  try {
    if (fs.statSync(projectPath).isFile()) {
      return projectPath
    } else {
      const configPath = path.resolve(projectPath, "tsconfig.json")
      return fs.statSync(configPath).isFile() ? configPath : null
    }
  } catch {
    return null
  }
}

const typecheck = (projectPath:string) => {
  const ts = loadTS(projectPath)
  const json = ts.readConfigFile(projectPath, ts.sys.readFile)
  const config = ts.parseJsonConfigFileContent(
      json.config,
      ts.sys,
      path.dirname(projectPath),
      undefined,
      path.basename(projectPath)
  );

  const errors = isIncrementalCompilation(config.options)
    ? performIncrementalCompilation(ts, projectPath)
    : performCompilation(ts, config)

  if (errors > 0) {
    setFailed(`Found ${errors} errors!`)
  }
}



const performIncrementalCompilation = (ts:TS, projectPath:string) => {

  const report = reporter(ts)
  
  const host = ts.createSolutionBuilderHost(ts.sys, undefined, report, report)
  const builder = ts.createSolutionBuilder(host, [projectPath], { noEmit: true })
  return builder.build()
}


const performCompilation = (ts: TS, config:ParsedCommandLine) => {
  const report = reporter(ts)
  const host = ts.createCompilerHost(config.options)
  const program = ts.createProgram({
    rootNames: config.fileNames,
    options: config.options,
    projectReferences: config.projectReferences,
    configFileParsingDiagnostics: ts.getConfigFileParsingDiagnostics(config)
  })

  
  const configuration = program.getConfigFileParsingDiagnostics()
  let all:Diagnostic[] = [...program.getSyntacticDiagnostics()]
  if (all.length === 0) {
    all = [
      ...program.getOptionsDiagnostics(),
      ...program.getGlobalDiagnostics()
    ]

    if (all.length == 0) {
      all = [...program.getSemanticDiagnostics()]
    }
  }
  const diagnostics = ts.sortAndDeduplicateDiagnostics(all)
  diagnostics.forEach(report)

  return all.length
}

const isIncrementalCompilation = (options: CompilerOptions) =>
  options.incremental || options.composite

const loadTS = (projectPath:string):TS => {
  try {
    const require = Module.createRequire(projectPath)
    const ts = require('typescript')
    console.log(`Using local typescript@${ts.version}`);
    return ts
  } catch (error) {
    const ts = require('typescript')
    console.log(`Failed to find project specific typescript, falling back to bundled typescript@${ts.version}`);
    return ts
  }
}


main()
