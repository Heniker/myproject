import * as tsMorph from 'ts-morph'
import * as vscode from 'vscode'
import assert from 'assert'
import _ from 'lodash/fp'
import { isAssignableToValue } from 'ts-simple-type'
import * as quicktype from 'quicktype-core'

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

export class VariableNotFound extends Error {}
export class InterfaceFault extends Error {}

export const init = (document: vscode.TextDocument) => {
  const program = new tsMorph.Project({ compilerOptions: {} })
  const tsFile = program.addSourceFileAtPath(document.fileName)

  return async (definitionLocation: number, runtimeRepresentation: any) => {
    const identifier = ((node = tsFile.getDescendantAtPos(definitionLocation)) =>
      tsMorph.Node.isIdentifier(node)
        ? node
        : node?.getParentWhile(tsMorph.Node.isIdentifier) || node?.getPreviousSibling())()

    const definition = identifier?.getDefinitionNodes()[0]

    assert(identifier, new VariableNotFound())
    assert(definition && tsMorph.Node.isVariableDeclaration(definition), new VariableNotFound())

    return (
      (await tryLocalInterfaces(definition, runtimeRepresentation)) ||
      (await tryCreateInterface(definition, runtimeRepresentation)) ||
      assert(false, new InterfaceFault())
    )
  }

  async function saveFile() {
    await document.save()
    tsFile.saveSync()
  }

  async function tryLocalInterfaces(
    definition: tsMorph.VariableDeclaration,
    runtimeRepresentation: any
  ) {
    const localInterface = ((checker = program.getTypeChecker().compilerObject) =>
      [...getKnownInterfaces(tsFile).entries()].find(([key]) =>
        isAssignableToValue(key.compilerNode, runtimeRepresentation, checker)
      ))()

    if (!localInterface || !localInterface[1]) {
      return false
    }

    definition.setType(localInterface[1])
    await saveFile()
    return true
  }

  async function tryCreateInterface(
    definition: tsMorph.VariableDeclaration,
    runtimeRepresentation: any
  ) {
    const name = await vscode.window.showInputBox({ prompt: 'Interface name' })

    if (!name) {
      // #todo>?>
      return false
    }

    const text = await typeThis(JSON.stringify(runtimeRepresentation), name)
    const insertLocation = tsFile.getImportDeclarations()?.pop()?.getEnd() || 0

    definition.setType(name[0].toUpperCase() + name.slice(1))
    tsFile.insertText(insertLocation, (insertLocation > 0 ? '\n\n' : '') + text)
    await saveFile()

    return true
  }
}

function getKnownInterfaces(file: tsMorph.SourceFile) {
  const getLocalName = (
    interfaceDec: tsMorph.InterfaceDeclaration,
    importStruct?: tsMorph.ImportDeclarationStructure
  ) => {
    if (!importStruct) {
      return interfaceDec.getName()
    }

    if (importStruct.namespaceImport) {
      return `${importStruct.namespaceImport}.${interfaceDec.getName()}`
    }

    if (importStruct.namedImports && Array.isArray(importStruct.namedImports)) {
      const result =
        importStruct.namedImports.find((it) => {
          return typeof it === 'function'
            ? false
            : typeof it === 'string'
            ? it === interfaceDec.getName()
            : 'name' in it
            ? it.name === interfaceDec.getName()
            : false
        }) || false

      return (
        result &&
        typeof result !== 'function' &&
        (typeof result === 'string' ? result : result.alias || result.name)
      )
    }

    return false
  }

  const externalInterfaces = file.getImportDeclarations().flatMap((importDec) => {
    const sourceFile = importDec.getModuleSpecifierSourceFile()
    const importStruct = importDec.getStructure()

    if (!sourceFile || sourceFile.isFromExternalLibrary()) {
      return []
    }

    return [...sourceFile.getExportedDeclarations().values()]
      .flat()
      .filter(tsMorph.Node.isInterfaceDeclaration)
      .flatMap((interfaceDec) => {
        const name = getLocalName(interfaceDec, importStruct)
        if (!name) {
          return []
        }

        return [[interfaceDec, name]] as const
      })
  })

  return new Map([
    ...externalInterfaces,
    ...file.getInterfaces().map((it) => [it, getLocalName(it)] as const),
  ])
}
