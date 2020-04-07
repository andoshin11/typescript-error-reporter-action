const glob = require('glob')
const path = require('path')
const fs = require('fs')

const referenceRegExp = /\/\/\/ <reference lib="(.*)" \/>/

/**
 * since we use CDN-hosted TS runtime, which is a bundled version,
 * we need to manually pre-bundle lib.*.d.ts files.
 */
async function main() {

  const currentDir = process.cwd()
  const libDTSFiles = glob.sync(path.resolve(currentDir, 'node_modules/typescript/lib/lib*.d.ts'))

  const libDTS = libDTSFiles.reduce((acc, ac) => {
    const libName = ac.replace(currentDir + '/node_modules/typescript/lib/', '')
    const content = fs.readFileSync(ac, 'utf8')
    const references = content.split('\n').map(l => l.match(referenceRegExp)).filter(Boolean).map(m => m[1])

    acc[libName] = {
      content,
      references
    }
    return acc
  }, {})

  fs.writeFileSync(path.resolve(currentDir, 'src/gen/libDTS.ts'), `export const libDTS: { [name: string]: { content: string; references: string[] } } = ${JSON.stringify(libDTS, null, '\t')}`)
}

main()
