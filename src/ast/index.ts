import * as ts from 'typescript'
import { TextChange } from '../types'
import { toRelativePath } from '../utils'
import { updateSourceFile } from './sourceFile'
import { findNode } from './node'

export const changeText = (sourceFile: ts.SourceFile, info: TextChange) => {
  const { span: { start, length }, newText } = info
  const replaceTarget = findNode(sourceFile, start, true /* lastChild */)
  if (!replaceTarget) {
    throw new Error(`could not find target node at ${toRelativePath(sourceFile.fileName)}:${start}`)
  }
  if (replaceTarget.getWidth() !== length) {
    // should not happen, but just in case you know?
    throw new Error(`Something went wrong`)
  }
  
  return updateSourceFile(sourceFile, newText, replaceTarget)
}
