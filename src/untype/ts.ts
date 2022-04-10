import assert from 'assert'
import json5 from 'json5'
import _ from 'lodash/fp'
import * as tsMorph from 'ts-morph'
import { isAssignableToValue } from 'ts-simple-type'
import * as vscode from 'vscode'
import { InterfaceCreationFault, VariableNotFound } from '@/errors'
import { typeThis } from '@/utils'
import { InferTypeTs } from '@/events'

type TypeChecker = import('typescript').TypeChecker
type Program = import('typescript').Program

export const a = 42

InferTypeTs.on((arg) => {
  const { evaluated, filePath, offset } = arg

  // quicktype does not support JSON5. So have to stick with standard JSON
  // which is a shame because we can't represent NaN, undefined and a bunch of other stuff
  // https://github.com/quicktype/quicktype/issues/1777
  void addInterfaces(filePath, offset, JSON.stringify(json5.parse(evaluated.result)))
})

async function saveFile(tsFile: tsMorph.SourceFile) {
  const filePath = tsFile.getFilePath()

  tsFile.saveSync()
  await vscode.window.visibleTextEditors
    .find((it) => it.document.fileName === filePath)
    ?.document?.save()
}

async function addInterfaces(
  filePath: string,
  definitionLocation: number,
  runtimeRepresentation: string
) {
  const program = new tsMorph.Project({ compilerOptions: {} })
  const tsFile = program.addSourceFileAtPath(filePath)

  const identifier = ((node = tsFile.getDescendantAtPos(definitionLocation)) =>
    tsMorph.Node.isIdentifier(node)
      ? node
      : node?.getParentWhile(tsMorph.Node.isIdentifier) || node?.getPreviousSibling())()

  assert(identifier, new VariableNotFound())

  const definition = identifier.getDefinitionNodes()[0]
  assert(definition && tsMorph.Node.isVariableDeclaration(definition), new VariableNotFound())

  return (
    (await tryLocalInterfaces(
      definition,
      runtimeRepresentation,
      tsFile,
      program.getTypeChecker().compilerObject
    )) ||
    (await tryCreateInterface(definition, runtimeRepresentation, tsFile)) ||
    assert(false, new InterfaceCreationFault())
  )
}

async function tryLocalInterfaces(
  definition: tsMorph.VariableDeclaration,
  runtimeRepresentation: string,
  tsFile: tsMorph.SourceFile,
  checker: tsMorph.ts.TypeChecker | TypeChecker | Program
) {
  const localInterface = [...getKnownInterfaces(tsFile).entries()].find(([key]) =>
    isAssignableToValue(key.compilerNode, JSON.parse(runtimeRepresentation), checker)
  )

  if (!localInterface || !localInterface[1]) {
    return false
  }

  definition.setType(localInterface[1])
  await saveFile(tsFile)
  return true
}

async function tryCreateInterface(
  definition: tsMorph.VariableDeclaration,
  runtimeRepresentation: string,
  tsFile: tsMorph.SourceFile
) {
  const name = await vscode.window.showInputBox({ prompt: 'Interface name' })

  if (!name) {
    console.log('<<< Interface creation cancelled >>>')
    return false
  }

  const text = await typeThis(runtimeRepresentation, name, 'ts')
  const insertLocation = tsFile.getImportDeclarations()?.pop()?.getEnd() || 0

  definition.setType(name[0].toUpperCase() + name.slice(1))
  tsFile.insertText(insertLocation, (insertLocation > 0 ? '\n\n' : '') + text)
  await saveFile(tsFile)

  return true
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
      const result = importStruct.namedImports.find((it) => {
        if (typeof it === 'function') {
          return false
        }
        if (typeof it === 'string') {
          return it === interfaceDec.getName()
        }
        if ('name' in it) {
          return it.name === interfaceDec.getName()
        }
        return false
      })

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
      .filter(tsMorph.Node.isInterfaceDeclaration.bind(tsMorph.Node))
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
  ] as const)
}
