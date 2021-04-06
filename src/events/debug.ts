import * as vscode from 'vscode'
import * as debug from '@/types'
import { Observable } from '../utils/observable'
import * as _ from 'lodash/fp'
import * as ts from 'typescript'

export const DebugMessage = new Observable<debug.EventT>()
export const DebugSessionEnd = new Observable<void | number>()
export const DebugSessionCreate = new Observable<debug.DebugSessionT>()

export const activate = _.once(() => {
  vscode.debug.registerDebugAdapterTrackerFactory('*', {
    createDebugAdapterTracker: (session: debug.DebugSessionT) => {
      DebugSessionCreate.emit(session)
      return {
        onDidSendMessage: DebugMessage.emit.bind(DebugMessage),
        onWillStopSession: DebugSessionEnd.emit.bind(DebugSessionEnd),
        onExit: DebugSessionEnd.emit.bind(DebugSessionEnd),
      }
    },
  })
})
