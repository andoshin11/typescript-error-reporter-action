import * as ts from 'typescript'
import { globSync, flatten } from '../utils'

/**
 * Get d.ts for options.types from options.typeRoots directories.
 */
export function getTypesDts(options: ts.CompilerOptions): string[] {
  const types = options.types
  if (!types) return []
  const typeRoots = options.typeRoots || ["node_modules/@types"]

  const normalizeRootPath = (root: string) => `${root}${root.endsWith('/') ? '' : '/'}`
  const createGlobPatterns = (type: string) => typeRoots
    .map(root => `${normalizeRootPath(root)}${type}/**/*.d.ts`)
  const targets = globSync(flatten(types.map(createGlobPatterns)))

  return [
    ...targets
  ]
}
