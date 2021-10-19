import * as quicktype from 'quicktype-core'

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
