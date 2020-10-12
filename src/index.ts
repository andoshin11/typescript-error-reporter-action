import * as path from 'path'
import * as fs from 'fs'
import { DiagnosticCategory } from 'typescript'
import { getInput, setFailed } from '@actions/core'
import { Doctor } from './doctor'
import { loadTSModule } from './loadTSModule'


async function main() {
  try {
    const project = getInput('project') || 'tsconfig.json'
    const tscPath = getInput('tsc')
    const projectPath = path.resolve(process.cwd(), project)
    if (!fs.existsSync(projectPath)) {
      throw new Error(`No such TS config file: ${projectPath}`)
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
    setFailed(e)
  }
}

main()
