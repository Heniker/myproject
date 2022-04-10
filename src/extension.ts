/*
Known issues:
`ts-simple-type` was used to check type assignability. This library is outdated and fails in several cases.
See this for solutions -
https://github.com/Microsoft/TypeScript/issues/9879
*/

import { Observable } from 'observable'
import * as vscode from 'vscode'
import {
  CopyTypeCommand,
  DebugMessage,
  DebugSessionCreate,
  DebugSessionEnd,
  InferTypeCommand,
} from './events'
import * as debug from '@/types'

const EXTENSION_NAME = 'debug-types'

export async function activate(context: vscode.ExtensionContext) {
  console.log('<<< Extension activated >>>')

  import('./commands')
  import('./events')
  import('./untype')

  vscode.commands.registerCommand(`${EXTENSION_NAME}.infer-type`, () => {
    Observable.emit(InferTypeCommand, undefined)
  })
  vscode.commands.registerCommand(`${EXTENSION_NAME}.copy-type`, () => {
    Observable.emit(CopyTypeCommand, undefined)
  })

  vscode.debug.registerDebugAdapterTrackerFactory('*', {
    createDebugAdapterTracker: (session: debug.DebugSessionT) => {
      Observable.emit(DebugSessionCreate, { session })
      return {
        onDidSendMessage: (arg: debug.EventT) =>
          Observable.emit(DebugMessage, { session, message: arg }),
        onWillStopSession: () => Observable.emit(DebugSessionEnd, { session }),
        onExit: (arg: number | undefined) =>
          Observable.emit(DebugSessionEnd, { session, message: arg }),
      }
    },
  })

  //   for (const it of Object.values(commands)) {
  //     const command = new it()
  //     vscode.commands.registerCommand(`${EXTENSION_NAME}.${command.name}`, command.run.bind(command))
  //   }
}
