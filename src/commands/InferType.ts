import assert from 'assert'
import path from 'path'
import * as vscode from 'vscode'
import { Command } from './types/Command'
import * as Debug from 'src/types'
import * as events from '../events'
import { assertBack } from '../utils/assertBack'
import * as untypeTs from '../untype/ts'

const getSelectedWord = (editor: vscode.TextEditor) =>
  editor.selection.isEmpty
    ? editor.document.getText(editor.document.getWordRangeAtPosition(editor.selection.active))
    : editor.document.getText(editor.selection)

// todo> this should be a generic InferType command class with better abstraction
// Do not think that it's a good idea to introduce classes for every untype instance
// Guess every untype instance should have full access to vscode api and
export class InferType extends Command {
  public readonly name = 'inferType'

  private session: Debug.DebugSessionT | undefined

  private currentFrame = 1

  private tsxWarningShown = false

  constructor() {
    super()
    events.DebugSessionCreate.on((it) => (this.session = it))
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
    const editor: vscode.TextEditor = assertBack(vscode.window.activeTextEditor)
    assert(editor.document)
    assert(editor.selection)
    assert(this.session, 'Debug session not found')

    const varName = getSelectedWord(editor)
    const fileExt = editor.document.fileName ? path.extname(editor.document.fileName).slice(1) : ''

    if (fileExt === 'tsx' && !this.tsxWarningShown) {
      this.tsxWarningShown = true
      vscode.window.showWarningMessage('Usage in tsx files is not tested. Expect unexpected!')
    } else if (fileExt !== 'ts') {
      vscode.window.showErrorMessage('Only TS files are supported ATM')
      return false
    }

    const evaluated = await this.session.customRequest('evaluate', {
      expression: varName,
      frameId: this.currentFrame,
      context: 'clipboard',
    })

    const runtimeRepresentation = JSON.parse(eval(`JSON.stringify(${evaluated.result})`))
    const offset = editor.document.offsetAt(editor.selection.active)

    assert(offset, 'Unexpected offset error')

    try {
      await untypeTs.init(editor.document)(offset, runtimeRepresentation)
    } catch (err) {
      if (err instanceof untypeTs.VariableNotFound) {
        vscode.window.showErrorMessage('Variable or definition not found')
      } else if (err instanceof untypeTs.InterfaceFault) {
        vscode.window.showErrorMessage('Interface creation failed')
      } else {
        vscode.window.showErrorMessage(err.message)
        throw err
      }
    }
  }
}
