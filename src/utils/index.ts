export * from './diagnostic'

export function nonNullable<T>(arg: T): arg is NonNullable<T> {
  return arg !== undefined || arg !== null
}
