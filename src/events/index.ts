import { Observable } from 'observable'
import * as debug from '@/types'

// #region debug
export const DebugMessage = new Observable<{
  session: debug.DebugSessionT
  message: debug.EventT
}>()
export const DebugSessionEnd = new Observable<{
  session: debug.DebugSessionT
  message?: number
}>()
export const DebugSessionCreate = new Observable<{ session: debug.DebugSessionT }>()

// #region infer-type
type InferTypeDataT = {
  evaluated: debug.CommandToResponseMapT['evaluate']['body']
  filePath: string
  offset: number
}

export const InferTypeAction = new Observable<InferTypeDataT>()
export const InferTypeTs = new Observable<InferTypeDataT>()

InferTypeAction.on((arg) => {
  Observable.emit(InferTypeTs, arg)
})

// #region commands
export const InferTypeCommand = new Observable()
export const CopyTypeCommand = new Observable()
