import vscode from 'vscode'
import { CopyTypeCommand } from '@/events'
import * as debug from '@/types'
import { runtimeValueAt, typeThis } from '@/utils'
import assert from 'assert'
import json5 from 'json5'

CopyTypeCommand.on(async () => {
  assert(vscode.debug.activeDebugSession)
  assert(vscode.window.activeTextEditor)
  assert(vscode.window.activeTextEditor.document)
  assert(vscode.window.activeTextEditor.selection)
  assert(vscode.window.activeTextEditor.document.fileName)

  const editor = vscode.window.activeTextEditor
  const debugSession = vscode.debug.activeDebugSession as debug.DebugSessionT

  const evaluated = await runtimeValueAt(debugSession, editor.document, editor.selection)

  const result = await typeThis(
    JSON.stringify(json5.parse(evaluated.result)),
    editor.document.fileName,
    editor.document.languageId
  )
  vscode.env.clipboard.writeText(result)
})
