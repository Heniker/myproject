import * as _ from 'lodash/fp'
import { Observable } from 'observable'
import * as vscode from 'vscode'
import * as debug from '@/types'

export const DebugMessage = new Observable<debug.EventT>()
export const DebugSessionEnd = new Observable<void | number>()
export const DebugSessionCreate = new Observable<debug.DebugSessionT>()

export const activate = _.once(() => {
  vscode.debug.registerDebugAdapterTrackerFactory('*', {
    createDebugAdapterTracker: (session: debug.DebugSessionT) => {
      Observable.emit(DebugSessionCreate, session)
      return {
        onDidSendMessage: (arg) => Observable.emit(DebugMessage, arg),
        onWillStopSession: () => Observable.emit(DebugSessionEnd, undefined),
        onExit: (arg) => Observable.emit(DebugSessionEnd, arg),
      }
    },
  })
})
