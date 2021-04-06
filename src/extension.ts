import * as vscode from 'vscode'
import * as commands from './commands'
import * as events from './events'

const EXTENSION_NAME = 'inferDebugTypes'

export function activate(context: vscode.ExtensionContext) {
  events.activate()

  Object.values(commands).forEach((it) => {
    const command = new it()
    vscode.commands.registerCommand(`${EXTENSION_NAME}.${command.name}`, command.run.bind(command))
  })
}
