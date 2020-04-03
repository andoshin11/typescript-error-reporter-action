import * as ts from 'typescript'

export function findNode(sourceFile: ts.SourceFile, position: number, lastChild: boolean = false): ts.Node | undefined {
  function find(node: ts.Node): ts.Node | undefined {
    if (position >= node.getStart() && position < node.getEnd()) {
      return ts.forEachChild(node, find) || node;
    }
  }
  const target = find(sourceFile)
  if (lastChild) {
    return target && findLastChild(target)
  } else {
    return target
  }
}

// if the node has children, retrive the first child
function findLastChild(node: ts.Node) {
  function find(n: ts.Node): ts.Node {
    return !n.getChildCount() ? n : find(n.getChildren()[0])
  }
  return find(node)
}
