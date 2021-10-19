import assert from 'assert'
import path from 'path'
import json5 from 'json5'
import * as vscode from 'vscode'
import * as events from '../events'
import * as untypeTs from '../untype/ts'
import { Command } from './types/Command'
import * as Debug from 'src/types'

const getSelectedWord = (editor: vscode.TextEditor) =>
  editor.selection.isEmpty
    ? editor.document.getText(editor.document.getWordRangeAtPosition(editor.selection.active))
    : editor.document.getText(editor.selection)

export class InferType extends Command {
  public readonly name = 'inferType'

  private session: Debug.DebugSessionT | undefined

  private currentFrame = 1

  constructor() {
    super()
    events.DebugSessionCreate.on((it) => {
      this.session = it
    })

    events.DebugMessage.on(async (msg) => {
      if (this.session && msg.event === 'stopped' && msg.body.threadId !== undefined) {
        const stackTrace = await this.session.customRequest('stackTrace', {
          threadId: msg.body.threadId,
          levels: 1,
        })
        this.currentFrame = stackTrace.stackFrames[0].id
      }
    })
  }

  async run() {
    const editor = vscode.window.activeTextEditor

    assert(editor)
    assert(editor.document)
    assert(editor.selection)
    assert(this.session, 'Debug session not found')

    const varName = getSelectedWord(editor)
    const fileExt = editor.document.fileName ? path.extname(editor.document.fileName).slice(1) : ''

    if (fileExt !== 'ts') {
      void vscode.window.showErrorMessage('Only TS files are supported ATM')
      return
    }

    const evaluated = await this.session.customRequest('evaluate', {
      expression: varName,
      frameId: this.currentFrame,
      context: 'clipboard',
    })

    // quicktype does not support JSON5. So have to stick with standard JSON
    // which is a shame because we can't represent NaN, undefined and a bunch of other stuff
    // https://github.com/quicktype/quicktype/issues/1777
    const runtimeRepresentation = JSON.stringify(json5.parse(evaluated.result))
    const offset = editor.document.offsetAt(editor.selection.active)

    assert(offset, 'Unexpected offset error')

    try {
      await untypeTs.addInterfaces(editor.document.fileName, offset, runtimeRepresentation)
    } catch (error) {
      if (error instanceof untypeTs.VariableNotFound) {
        void vscode.window.showErrorMessage('Variable or definition not found')
      } else if (error instanceof untypeTs.InterfaceFault) {
        void vscode.window.showErrorMessage('Interface creation failed')
      } else {
        // vscode.window.showErrorMessage(err.message)
        throw error
      }
    }
  }
}
