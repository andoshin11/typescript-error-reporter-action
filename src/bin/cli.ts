import * as commander from 'commander'
import * as path from 'path'
import * as fs from 'fs'
import { Doctor } from '../doctor'
import { exec as run } from './commands/run'

/**
 * Idea:
 *
 * - https://qiita.com/toshi-toma/items/ea76b8894e7771d47e10
 * - https://github.com/patorjk/figlet.js
 * - https://github.com/sindresorhus/ora
 * - https://github.com/bahamas10/node-clear
 */

const pkg = require('../../package.json')

commander
  .version(pkg.version)
  .command('run')
  .action(async () => {
    try {
      const currentDir = process.cwd()
      const configPath = path.resolve(currentDir, 'tsconfig.json')
      if (!fs.existsSync(configPath)) {
        throw new Error(`could not find tsconfig.json at: ${currentDir}`)
      }

      const doctor = Doctor.fromConfigFile(configPath, true)
      await run(doctor)

    } catch (e) {
      throw e
    }
  })

commander.parse(process.argv)
