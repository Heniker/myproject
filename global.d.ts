declare type Implements<T, U extends T> = {}

// https://github.com/Microsoft/TypeScript/issues/12936#issuecomment-368244671
declare type Exact<T, U extends T> = T &
  {
    [K in keyof U]: K extends keyof T ? U[K] : never
  }

declare type ValueOf<T> = T extends Array<infer U> ? U : T[keyof T]

declare module 'json-schema-to-jsdoc'