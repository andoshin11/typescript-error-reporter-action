export * from './diagnostic'

export function nonNullable<T>(arg: T): arg is NonNullable<T> {
  return arg !== undefined || arg !== null
}

export function mutable<T>(arg: readonly T[]): T[] {
  return [...arg]
}

export function flatten<T>(data: T[][]): T[] {
  return data.reduce((acc, ac) => [...acc, ...ac], [] as T[])
}

// filter items of a which does not exist in b
export function diff<T>(a: T[], b: T[]): T[] {
  return a.filter(item => !b.includes(item))
}

export const pluck = <T extends object, K extends keyof T>(data: T[], key: K): T[K][] => data.map(item => item[key])

export const uniqBy = <T extends object>(arr: T[], key: keyof T) => {
  const propList = pluck(arr, key)
  return arr.filter((elm, i, self) => propList.indexOf(elm[key]) === i)
}

export function pipe<T1>(first: (...args: any[]) => T1): T1
export function pipe<T1, T2>(first: (...args: any[]) => T1, second: (a: T1) => T2): T2
export function pipe<T1, T2, T3>(first: (...args: any[]) => T1, second: (a: T1) => T2, third: (a: T2) => T3): T3
export function pipe<T1, T2, T3, T4>(first: (...args: any[]) => T1, second: (a: T1) => T2, third: (a: T2) => T3, fourth: (a: T3) => T4): T4
export function pipe<T1, T2, T3, T4, T5>(first: (...args: any[]) => T1, second: (a: T1) => T2, third: (a: T2) => T3, fourth: (a: T3) => T4, fifth: (a: T4) => T5): T5
export function pipe<T1, T2, T3, T4, T5, T6>(first: (...args: any[]) => T1, second: (a: T1) => T2, third: (a: T2) => T3, fourth: (a: T3) => T4, fifth: (a: T4) => T5, sixth: (a: T5) => T6): T6
export function pipe<T1, T2, T3, T4, T5, T6, T7>(
  first: (...args: any[]) => T1,
  second: (a: T1) => T2,
  third: (a: T2) => T3,
  fourth: (a: T3) => T4,
  fifth: (a: T4) => T5,
  sixth: (a: T5) => T6,
  seventh: (a: T6) => T7
): T7
export function pipe<T1, T2, T3, T4, T5, T6, T7, T8>(
  first: (...args: any[]) => T1,
  second: (a: T1) => T2,
  third: (a: T2) => T3,
  fourth: (a: T3) => T4,
  fifth: (a: T4) => T5,
  sixth: (a: T5) => T6,
  seventh: (a: T6) => T7,
  eighth: (a: T7) => T8
): T8
export function pipe(first: Function, ...args: Function[]): any {
  return args && args.length ? args.reduce((result, next) => next(result), first()) : first()
}
