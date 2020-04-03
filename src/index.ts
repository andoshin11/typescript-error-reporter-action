import * as path from 'path'
import * as fs from 'fs'
import { Doctor } from './doctor'

async function main() {
  try {

    const currentDir = process.cwd()
    const configPath = path.resolve(currentDir, 'tsconfig.json')
    if (!fs.existsSync(configPath)) {
      throw new Error(`could not find tsconfig.json at: ${currentDir}`)
    }

    const localTSPath = path.resolve(currentDir, 'node_modules', 'typescript')
    if (!fs.existsSync(localTSPath)) {
      throw new Error(`could not find local typescript module at : ${localTSPath}`)
    }
    const localTS = require(localTSPath)

    const doctor = Doctor.fromConfigFile(configPath, localTS)
    const diagnostics = doctor.getSemanticDiagnostics()
    doctor.reporter.reportDiagnostics(diagnostics)
  } catch (e) {
    throw e
  }
}

main()
