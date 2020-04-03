import { issueCommand } from '@actions/core/lib/command'
import * as path from 'path'
import * as fs from 'fs'
import * as ts from 'typescript'
import { Doctor } from './doctor'

async function main() {
  try {

    const currentDir = process.cwd()
    const configPath = path.resolve(currentDir, 'tsconfig.json')
    if (!fs.existsSync(configPath)) {
      throw new Error(`could not find tsconfig.json at: ${currentDir}`)
    }

    const doctor = Doctor.fromConfigFile(configPath)
    const diagnostics = doctor.getSemanticDiagnostics()
    doctor.reporter.reportDiagnostics(diagnostics)
  } catch (e) {
    throw e
  }
}

main()
