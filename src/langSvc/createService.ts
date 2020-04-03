import * as _ts from 'typescript'

export const createService = (host: _ts.LanguageServiceHost, ts: typeof _ts) => {
  return ts.createLanguageService(host, ts.createDocumentRegistry())
}
