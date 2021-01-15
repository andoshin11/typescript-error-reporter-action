import * as _ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { FileEntry } from '../types';
import { libDTS } from '../gen/libDTS';

const libDTSRegexp = /^lib\..*\.d\.ts$/;

export const createHost = (
  fileNames: string[],
  compilerOptions: _ts.CompilerOptions,
  fileEntry: FileEntry,
  ts: typeof _ts
): _ts.LanguageServiceHost => {
  const getCurrentVersion = (fileName: string) => (fileEntry.has(fileName) ? fileEntry.get(fileName)!.version : 0);
  const getTextFromSnapshot = (snapshot: _ts.IScriptSnapshot) => snapshot.getText(0, snapshot.getLength());

  const readFile = (fileName: string, encoding: BufferEncoding = 'utf8') => {
    if (libDTSRegexp.test(fileName)) {
      return libDTS[fileName].content;
    }

    fileName = path.normalize(fileName);
    try {
      return fs.readFileSync(fileName, encoding as 'utf8');
    } catch (e) {
      return undefined;
    }
  };

  const readFileWithFallback = (filePath: string, encoding?: BufferEncoding) => {
    return ts.sys.readFile(filePath, encoding) || readFile(filePath, encoding);
  };

  const moduleResolutionHost: _ts.ModuleResolutionHost = {
    fileExists: (fileName) => {
      return ts.sys.fileExists(fileName) || readFile(fileName) !== undefined;
    },
    readFile: (fileName) => {
      if (fileEntry.has(fileName)) {
        const snapshot = fileEntry.get(fileName)!.scriptSnapshot;
        return getTextFromSnapshot(snapshot);
      }
      return readFileWithFallback(fileName);
    },
    realpath: ts.sys.realpath,
    directoryExists: ts.sys.directoryExists,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getDirectories: ts.sys.getDirectories,
  };

  const host: _ts.LanguageServiceHost = {
    getScriptFileNames: () => fileNames,
    getScriptVersion: (fileName) => getCurrentVersion(fileName) + '',
    getScriptSnapshot: (fileName) => {
      if (fileEntry.has(fileName)) {
        return fileEntry.get(fileName)!.scriptSnapshot;
      } else {
        const isLibDTS = libDTSRegexp.test(fileName);
        if (!isLibDTS && !fs.existsSync(fileName)) {
          return undefined;
        }
        const content = isLibDTS ? libDTS[fileName].content : fs.readFileSync(fileName).toString();

        const scriptSnapshot = ts.ScriptSnapshot.fromString(content);
        fileEntry.set(fileName, { version: 0, scriptSnapshot });
        return scriptSnapshot;
      }
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => compilerOptions,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    resolveModuleNames: (moduleNames, containingFile, _, __, options) => {
      const ret: (_ts.ResolvedModule | undefined)[] = moduleNames.map((name) => {
        if (/\.vue$/.test(name)) {
          const resolved: _ts.ResolvedModule = {
            resolvedFileName: normalize(path.resolve(path.dirname(containingFile), name)),
          };
          return resolved;
        }

        const { resolvedModule } = ts.resolveModuleName(name, containingFile, options, moduleResolutionHost);
        return resolvedModule;
      });
      return ret;
    },
    fileExists: moduleResolutionHost.fileExists,
    readFile: moduleResolutionHost.readFile,
    readDirectory: ts.sys.readDirectory,
    getDirectories: ts.sys.getDirectories,
    realpath: moduleResolutionHost.realpath,
  };

  return host;
};

// .ts suffix is needed since the compiler skips compile
// if the file name seems to be not supported types
function normalize(fileName: string): string {
  if (/\.vue$/.test(fileName)) {
    return fileName + '.ts';
  }
  return fileName;
}
