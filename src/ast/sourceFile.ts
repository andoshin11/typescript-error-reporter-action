import * as ts from 'typescript'

export function updateSourceFile(sourceFile: ts.SourceFile, updateText: string, replaceTarget: ts.Node):ts.SourceFile {
  const start = replaceTarget.getStart();
  const end = replaceTarget.getEnd();
  const oldText = sourceFile.text;
  const pre = oldText.substring(0, start);
  const post = oldText.substring(end);
  const newText = pre + updateText + post;
  const textChangeRange: ts.TextChangeRange = {
      span: {
          start: start,
          length: (end - start)
      },

      newLength: (updateText.length)
  }
  return sourceFile.update(newText, textChangeRange);
}
