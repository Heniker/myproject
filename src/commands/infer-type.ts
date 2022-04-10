import assert from 'assert'
import path from 'path'
import _ from 'lodash/fp'
import { Observable } from 'observable'
import * as vscode from 'vscode'
import * as debug from '@/types'
import { InferTypeAction, InferTypeCommand } from '@/events'
import { runtimeValueAt } from '@/utils'

InferTypeCommand.on(async () => {
  assert(vscode.debug.activeDebugSession)
  assert(vscode.window.activeTextEditor)
  assert(vscode.window.activeTextEditor.document)
  assert(vscode.window.activeTextEditor.selection)
  assert(vscode.window.activeTextEditor.document.fileName)

  const editor = vscode.window.activeTextEditor
  const debugSession = vscode.debug.activeDebugSession as debug.DebugSessionT
  const evaluated = await runtimeValueAt(debugSession, editor.document, editor.selection)

  Observable.emit(InferTypeAction, {
    evaluated,
    filePath: editor.document.fileName,
    offset: vscode.window.activeTextEditor.document.offsetAt(
      vscode.window.activeTextEditor.selection.active
    ),
  })
})
