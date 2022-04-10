import * as quicktype from 'quicktype-core'
import type * as debug from '@/types'
import type vscode from 'vscode'

export const typeThis = async (
  json: string,
  name = '',
  lang: Parameters<typeof quicktype.jsonInputForTargetLanguage>[0]
) => {
  const qt = quicktype.jsonInputForTargetLanguage(lang)
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

export const runtimeValueAt = async (
  debugSession: debug.DebugSessionT,
  document: vscode.TextDocument,
  selection: vscode.Selection
) => {
  const word = selection.isEmpty
    ? document.getText(document.getWordRangeAtPosition(selection.active))
    : document.getText(selection)
  const { threads } = await debugSession.customRequest('threads', undefined)
  const stackTrace = await debugSession.customRequest('stackTrace', {
    threadId: threads[0].id,
    levels: 1,
  })

  const evaluated = await debugSession.customRequest('evaluate', {
    expression: word,
    frameId: stackTrace.stackFrames[0].id,
    context: 'clipboard',
  })

  return evaluated
}
