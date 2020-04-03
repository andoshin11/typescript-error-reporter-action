import * as glob from 'glob'

export function globSync (patterns: string | string[]): string[] {
  if (typeof patterns === 'string') {
    patterns = [patterns]
  }

  return patterns.reduce((acc, pattern) => {
    return acc.concat(glob.sync(pattern))
  }, [] as string[])
}
