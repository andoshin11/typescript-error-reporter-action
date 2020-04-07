export * from './diagnostic'
import { libDTS } from '../gen/libDTS'

export function nonNullable<T>(arg: T): arg is NonNullable<T> {
  return arg !== undefined || arg !== null
}

export const uniq = <T>(arr: T[]) => arr.filter((elm, i, self) => self.indexOf(elm) === i)

export function getAllLibs(libs: string[]) {
  const allLibs: { [name: string]: boolean } = {}

  const libDTSRegexp = /^lib.*\.d\.ts$/

  const resolveReferences = (libName: string) => {
    if (!libDTSRegexp.test(libName)) {
      libName = `lib.${libName}.d.ts`
    }

    allLibs[libName] = true
    const references = libDTS[libName].references
    if (!references.length) return
    references.forEach(resolveReferences)
  }

  libs.forEach(resolveReferences)

  return Object.keys(allLibs)
}
