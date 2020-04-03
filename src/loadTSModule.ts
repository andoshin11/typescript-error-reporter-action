import * as https from 'https'
const concat = require('concat-stream')

type TSModule = typeof import('typescript')

export const loadTSModule = async (version: string) => {
  let localTS: TSModule

  try {
    const CDNPath = `https://cdnjs.cloudflare.com/ajax/libs/typescript/${version}/typescript.min.js`
    const remoteScript = await fetchScript(CDNPath)
    localTS = _eval(remoteScript)
    console.log(`Loaded typescript@${localTS.version} from CDN.`);
  } catch (e) {
    localTS = require('typescript');
    console.log(`Failed to load typescript from CDN. Using bundled typescript@${localTS.version}.`);
  }

  return localTS
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
