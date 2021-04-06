type Implements<T, U extends T> = {}

// https://github.com/Microsoft/TypeScript/issues/12936#issuecomment-368244671
type Exact<T, U extends T> = T &
  {
    [K in keyof U]: K extends keyof T ? U[K] : never
  }

type ValueOf<T> = T extends Array<infer U> ? U : T[keyof T]

type runtype = any

declare module 'json-schema-to-jsdoc'

type Falsy = false | 0 | '' | null | undefined

interface Array<T> {
  filter<S extends T>(predicate: BooleanConstructor, thisArg?: any): Exclude<S, Falsy>[]
  // filter<S extends T>(
  //   callback: (
  //     value: T,
  //     index: number,
  //     array: T[]
  //   ) => Falsy extends infer U ? [] : S | ReadonlyArray<S>
  // ): S[]
}
