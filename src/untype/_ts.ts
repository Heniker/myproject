// import assert from 'assert'
// import _ from 'lodash/fp'
// import * as quicktype from 'quicktype-core'
// import * as tsMorph from 'ts-morph'
// import { isAssignableToValue } from 'ts-simple-type'
// import { TypeChecker, Program } from 'typescript'
// import * as vscode from 'vscode'

// export class VariableNotFound extends Error {}
// export class InterfaceFault extends Error {}

// export const init = (filePath: string) => {
//   const program = new tsMorph.Project({ compilerOptions: {} })
//   const tsFile = program.addSourceFileAtPath(filePath)

//   return async (definitionLocation: number, runtimeRepresentation: any) => {
//     const identifier = ((node = tsFile.getDescendantAtPos(definitionLocation)) =>
//       tsMorph.Node.isIdentifier(node)
//         ? node
//         : node?.getParentWhile(tsMorph.Node.isIdentifier) || node?.getPreviousSibling())()

//     const definition = identifier?.getDefinitionNodes()[0]

//     assert(identifier, new VariableNotFound())
//     assert(definition && tsMorph.Node.isVariableDeclaration(definition), new VariableNotFound())

//     return (
//       (await tryLocalInterfaces(
//         definition,
//         runtimeRepresentation,
//         tsFile,
//         program.getTypeChecker().compilerObject
//       )) ||
//       (await tryCreateInterface(definition, runtimeRepresentation, tsFile)) ||
//       assert(false, new InterfaceFault())
//     )
//   }
// }

// async function typeThis(json: string, name = '', lang = 'ts') {
//   const qt = quicktype.jsonInputForTargetLanguage('ts')
//   const inputData = new quicktype.InputData()

//   await qt.addSource({ name, samples: [json] })
//   inputData.addInput(qt)

//   const typings = await quicktype.quicktype({
//     inputData,
//     lang,
//     // renderOptions typing is broken
//     rendererOptions: { 'just-types': '1' },
//   })

//   return typings.lines.join('\n')
// }

// async function tryLocalInterfaces(
//   definition: tsMorph.VariableDeclaration,
//   runtimeRepresentation: any,
//   tsFile: tsMorph.SourceFile,
//   checker: tsMorph.ts.TypeChecker | TypeChecker | Program
// ) {
//   const localInterface = [...getKnownInterfaces(tsFile).entries()].find(([key]) =>
//     isAssignableToValue(key.compilerNode, runtimeRepresentation, checker)
//   )

//   if (!localInterface || !localInterface[1]) {
//     return false
//   }

//   definition.setType(localInterface[1])
//   await saveFile(tsFile)
//   return true
// }

// async function tryCreateInterface(
//   definition: tsMorph.VariableDeclaration,
//   runtimeRepresentation: string,
//   tsFile: tsMorph.SourceFile
// ) {
//   const name = await vscode.window.showInputBox({ prompt: 'Interface name' })

//   if (!name) {
//     // #todo>?>
//     return false
//   }

//   const text = await typeThis(JSON.stringify(runtimeRepresentation), name)
//   const insertLocation = tsFile.getImportDeclarations()?.pop()?.getEnd() || 0

//   definition.setType(name[0].toUpperCase() + name.slice(1))
//   tsFile.insertText(insertLocation, (insertLocation > 0 ? '\n\n' : '') + text)
//   await saveFile(tsFile)

//   return true
// }

// async function saveFile(tsFile: tsMorph.SourceFile) {
//   const filePath = tsFile.getFilePath()

//   await vscode.window.visibleTextEditors
//     .find((it) => it.document.fileName === filePath)
//     ?.document?.save()
//   tsFile.saveSync()
// }

// function getKnownInterfaces(file: tsMorph.SourceFile) {
//   const getLocalName = (
//     interfaceDec: tsMorph.InterfaceDeclaration,
//     importStruct?: tsMorph.ImportDeclarationStructure
//   ) => {
//     if (!importStruct) {
//       return interfaceDec.getName()
//     }

//     if (importStruct.namespaceImport) {
//       return `${importStruct.namespaceImport}.${interfaceDec.getName()}`
//     }

//     if (importStruct.namedImports && Array.isArray(importStruct.namedImports)) {
//       const result = importStruct.namedImports.find((it) => {
//         if (typeof it === 'function') {
//           return false
//         }
//         if (typeof it === 'string') {
//           return it === interfaceDec.getName()
//         }
//         if ('name' in it) {
//           return it.name === interfaceDec.getName()
//         }
//         return false
//       })

//       return (
//         result &&
//         typeof result !== 'function' &&
//         (typeof result === 'string' ? result : result.alias || result.name)
//       )
//     }

//     return false
//   }

//   const externalInterfaces = file.getImportDeclarations().flatMap((importDec) => {
//     const sourceFile = importDec.getModuleSpecifierSourceFile()
//     const importStruct = importDec.getStructure()

//     if (!sourceFile || sourceFile.isFromExternalLibrary()) {
//       return []
//     }

//     return [...sourceFile.getExportedDeclarations().values()]
//       .flat()
//       .filter(tsMorph.Node.isInterfaceDeclaration.bind(tsMorph.Node))
//       .flatMap((interfaceDec) => {
//         const name = getLocalName(interfaceDec, importStruct)
//         if (!name) {
//           return []
//         }

//         return [[interfaceDec, name]] as const
//       })
//   })

//   return new Map([
//     ...externalInterfaces,
//     ...file.getInterfaces().map((it) => [it, getLocalName(it)] as const),
//   ])
// }
