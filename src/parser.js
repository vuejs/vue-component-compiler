const compiler = require('vue-template-compiler')
const defaults = require('lodash.defaultsdeep')
const LRU = require('lru-cache')
const hash = require('hash-sum')
const { SourceMapGenerator } = require('source-map')

const cache = LRU(100)
const splitRE = /\r?\n/g
const emptyRE = /^(?:\/\/)?\s*$/

module.exports = function (content, filename, config) {
  config = defaults(config, { needMap: true })

  const cacheKey = hash(filename + content)
  const filenameWithHash = filename + '?' + cacheKey // source-map cache busting for hot-reloadded modules

  if (cache.has(cacheKey)) return cache.get(cacheKey)

  const output = compiler.parseComponent(content, { pad: 'line' })
  if (config.needMap) {
    if (output.script && !output.script.src) {
      output.script.map = generateSourceMap(
        filenameWithHash,
        content,
        output.script.content
      )
    }
    if (output.styles) {
      output.styles.forEach(style => {
        if (!style.src) {
          style.map = generateSourceMap(
            filenameWithHash,
            content,
            style.content
          )
        }
      })
    }
  }
  cache.set(cacheKey, output)

  return output
}

function generateSourceMap (filename, source, generated) {
  const map = new SourceMapGenerator()

  map.setSourceContent(filename, source)

  generated.split(splitRE).forEach((line, index) => {
    if (!emptyRE.test(line)) {
      map.addMapping({
        source: filename,
        original: {
          line: index + 1,
          column: 0
        },
        generated: {
          line: index + 1,
          column: 0
        }
      })
    }
  })

  return map.toJSON()
}
