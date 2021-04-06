import assert from 'assert'
import { Truthy } from 'lodash'

export const assertBack = <T>(val: T, msg?: string | Error): Truthy<T> => {
  assert(val, msg)
  return val as any
}
