import {
  SourceMapConsumer,
  SourceMapGenerator,
  RawSourceMap,
  MappingItem
} from 'source-map'

export function merge(
  oldMap: RawSourceMap,
  newMap: RawSourceMap
): RawSourceMap {
  if (!oldMap) return newMap
  if (!newMap) return oldMap

  const oldMapConsumer: SourceMapConsumer = new SourceMapConsumer(oldMap) as any
  const newMapConsumer: SourceMapConsumer = new SourceMapConsumer(newMap) as any
  const mergedMapGenerator = new SourceMapGenerator()

  // iterate on new map and overwrite original position of new map with one of old map
  newMapConsumer.eachMapping((mapping: MappingItem) => {
    // pass when `originalLine` is null.
    // It occurs in case that the node does not have origin in original code.
    if (mapping.originalLine == null) return

    const origPosInOldMap = oldMapConsumer.originalPositionFor({
      line: mapping.originalLine,
      column: mapping.originalColumn
    })

    if (origPosInOldMap.source == null) return

    mergedMapGenerator.addMapping({
      original: {
        line: origPosInOldMap.line,
        column: origPosInOldMap.column
      },
      generated: {
        line: mapping.generatedLine,
        column: mapping.generatedColumn
      },
      source: origPosInOldMap.source,
      name: origPosInOldMap.name
    } as any)
  })

  const maps = [oldMap, newMap]
  const consumers = [oldMapConsumer, newMapConsumer]
  consumers.forEach((consumer, index) => {
    maps[index].sources.forEach(sourceFile => {
      const sourceContent = consumer.sourceContentFor(sourceFile, true)
      if (sourceContent !== null) {
        mergedMapGenerator.setSourceContent(sourceFile, sourceContent)
      }
    })
  })

  return JSON.parse(mergedMapGenerator.toString())
}
