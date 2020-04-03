import * as ts from 'typescript'

export const createService = (host: ts.LanguageServiceHost) => {
  return ts.createLanguageService(host, ts.createDocumentRegistry())
}
