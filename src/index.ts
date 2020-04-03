import * as path from 'path'
import * as fs from 'fs'
import { Doctor } from './doctor'

type TSModule = typeof import('typescript')

async function main() {
  try {

    const currentDir = process.cwd()
    const configPath = path.resolve(currentDir, 'tsconfig.json')
    if (!fs.existsSync(configPath)) {
      throw new Error(`could not find tsconfig.json at: ${currentDir}`)
    }

    const localTSPath = path.resolve(currentDir, 'node_modules/typescript')
    if (!fs.existsSync(localTSPath)) {
      throw new Error(`could not find local typescript module at : ${localTSPath}`)
    }

    let localTS: TSModule

    try {
      localTS = require(localTSPath);
      console.log(`Loaded typescript@${localTS.version} from workspace.`);
    } catch (err) {
      localTS = require('typescript');
      console.log(`Failed to load typescript from workspace. Using bundled typescript@${localTS.version}.`);
    }

    const doctor = Doctor.fromConfigFile(configPath, localTS)
    const diagnostics = doctor.getSemanticDiagnostics()
    doctor.reporter.reportDiagnostics(diagnostics)
  } catch (e) {
    console.log(e)
  }
}

main()
