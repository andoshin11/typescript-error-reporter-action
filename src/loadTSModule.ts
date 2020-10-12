import * as https from 'https'
import Module from 'module'
const concat = require('concat-stream')
import * as YarnLockFile from '@yarnpkg/lockfile'
import * as path from 'path'
import * as fs from 'fs'

type TSModule = typeof import('typescript')


export const loadTSModule = async (projectPath:string) => {
  let ts: TSModule = await loadLocalTSModule(projectPath).catch(_ => null)
    || await loadRemoteTSModule(projectPath).catch(_ => null)
    || loadBundledTSModule()
  
  return ts
}


/**
 * Attempts to load typescript for the given project path by loading `typescript`
 * from with-in it. If fails (e.g. no such module is installed) returns null.
 */

const loadLocalTSModule = async (projectPath: string) => {
  const require = Module.createRequire(projectPath)
  const ts = require('typescript')
  console.log(`Using local typescript@${ts.version}`);
  return ts
}

const loadBundledTSModule = () => {
  const ts = require('typescript')
  console.log(`Failed to find project specific typescript, falling back to bundled typescript@${ts.version}`);
  return ts
}

const loadRemoteTSModule = async(projectPath:string) => {
  const version = parseTSVersion(projectPath)
  const CDNPath = `https://cdnjs.cloudflare.com/ajax/libs/typescript/${version}/typescript.min.js`
  const remoteScript = await fetchScript(CDNPath)
  const ts = _eval(remoteScript)
  console.log(`Loaded typescript@${ts.version} from CDN.`);
  return ts
}

async function fetchScript(url: string) {
  return new Promise<string>((resolve, reject) => {
    try {
      https.get(url, function (res) {
        res.setEncoding('utf8')
        res.pipe(concat({ encoding: 'string' }, function (remoteSrc: string) {
          resolve(remoteSrc)
        }))
      })
    } catch (e) {
      reject(e)
    }
  })
}

function _eval(script: string): any {
  const _isEmpty = (o: object) => {
    return ((o == null) || (o instanceof Array && o.length == 0) || (typeof(o) == "object" && Object.keys(o).length == 0))
  }

  const loadScript = (_script: string) => {
		const exports = {};

		try {
			eval(_script);
		} catch(e){
			throw new Error(`Exception evaluating remote code '${_script}'`);
    }
    
		if (!_isEmpty(exports) && _isEmpty(module.exports))
			module.exports = exports;
  }

	const module = {
    exports: {}
  };

  loadScript(script)

	return module.exports;
}

function parseTSVersion(projectPath: string) {
  const yarnLockFilePath = path.resolve(projectPath, './yarn.lock')
  const packageLockFile = path.resolve(projectPath, './package-lock.json')
  if (fs.existsSync(yarnLockFilePath)) {
    const content = fs.readFileSync(yarnLockFilePath, 'utf8')
    return parseTSVersionFromYarnLockFile(content)
  } else if (fs.existsSync(packageLockFile)) {
    const content = fs.readFileSync(packageLockFile, 'utf8')
    return parseTSVersionFromPackageLockFile(content)
  } else {
    throw new Error('no lock file found.')
  }
}

function parseTSVersionFromYarnLockFile(content: string) {
  const { type, object } = YarnLockFile.parse(content)
  if (type !== 'success') {
    throw new Error('failed to parse yarn.lock')
  }
  const packages = Object.keys(object)
  const _typescript = packages.find(p => /^typescript@.*/.test(p))
  if (!_typescript) {
    throw new Error('could not find typescript in yarn.lock')
  }
  const _typescriptInfo = object[_typescript]
  const tsVersion = _typescriptInfo && _typescriptInfo['version']
  if (typeof tsVersion !== 'string') {
    throw new Error('could not par typescript version from yarn.lock')
  }
  return tsVersion
}

function parseTSVersionFromPackageLockFile(content: string) {
  const json = JSON.parse(content)
  const dependencies = json['dependencies'] || {}
  const _typescriptInfo = dependencies['typescript']
  if (!_typescriptInfo) {
    throw new Error('could not find typescript in package-lock.json')
  }
  const tsVersion = _typescriptInfo['version']
  if (typeof tsVersion !== 'string') {
    throw new Error('could not par typescript version from yarn.lock')
  }
  return tsVersion
}
