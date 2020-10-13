import * as path from 'path'
import * as fs from 'fs'
import { DiagnosticCategory } from 'typescript'
import { getInput, setFailed } from '@actions/core'
import { Doctor } from './doctor'
import { loadTSModule } from './loadTSModule'


async function main() {
  try {
    const project = getInput('project') || 'tsconfig.json'
    const projectPath = resolveProjectPath(path.resolve(process.cwd(), project))

    if (projectPath == null) {
      throw new Error(`No valid typescript project was not found at: ${projectPath}`)
    }

    const ts = await loadTSModule(projectPath)
  
    const doctor = Doctor.fromConfigFile(projectPath, ts)
    const diagnostics = doctor.getSemanticDiagnostics()

    if (diagnostics) {
      doctor.reporter.reportDiagnostics(diagnostics)
      const errors = diagnostics.filter(d => d.category === DiagnosticCategory.Error)
      if (errors.length) {
        setFailed(`Found ${errors.length} errors!`)
      }
    }

  } catch (e) {
    console.error(e.toString())
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

main()
