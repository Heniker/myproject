import assert from 'assert'
import path from 'path'
import * as quicktype from 'quicktype-core'
import * as vscode from 'vscode'
import * as Debug from '@types'

const getSelectedWord = (editor?: vscode.TextEditor | undefined) =>
  editor?.selection?.isEmpty
    ? editor?.document.getText(editor?.document.getWordRangeAtPosition(editor?.selection.active))
    : editor?.document.getText(editor?.selection)

const typeThis = async (json: string, name = '', lang = 'ts') => {
  const qt = quicktype.jsonInputForTargetLanguage('ts')
  const inputData = new quicktype.InputData()

  await qt.addSource({ name, samples: [json] })
  inputData.addInput(qt)

  const typings = await quicktype.quicktype({
    inputData,
    lang,
    // renderOptions typing is broken
    rendererOptions: { 'just-types': '1' },
  })

  return typings.lines.join('\n')
}

export function activate(context: vscode.ExtensionContext) {
  let session: Debug.DebugSessionT | undefined
  let currentFrame: number

  void vscode.commands.registerCommand('inferDebugTypes.copyTypeToClipboard', async () => {
    const varName = getSelectedWord(vscode.window.activeTextEditor)
    const fileExt = vscode.window.activeTextEditor?.document.fileName
      ? path.extname(vscode.window.activeTextEditor?.document.fileName).slice(1)
      : ''

    assert(session, 'Debug session not found')
    assert(varName, 'Selected variable not found')

    const evaluated = await session.customRequest('evaluate', {
      expression: varName,
      frameId: currentFrame,
      context: 'clipboard',
    })

    const result = eval(`JSON.stringify(${evaluated.result})`)

    const typings = await typeThis(result, varName, fileExt)
    await vscode.env.clipboard.writeText(typings)
    void vscode.window.showInformationMessage(`'${varName}' type was placed in clipboard`)
  })

  vscode.debug.registerDebugAdapterTrackerFactory('*', {
    createDebugAdapterTracker: (session_: vscode.DebugSession) => {
      session = session_

      return {
        async onDidSendMessage(msg: Debug.EventT) {
          if (session && msg.event === 'stopped' && msg.body.threadId !== undefined) {
            const stackTrace = await session.customRequest('stackTrace', {
              threadId: msg.body.threadId,
              levels: 1,
            })
            currentFrame = stackTrace.stackFrames[0].id
          }
        },
        onWillStopSession() {
          session = undefined
        },
        onExit() {
          session = undefined
        },
      }
    },
  })
}
