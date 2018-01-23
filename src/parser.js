const compiler = require('vue-template-compiler')
const { struct } = require('superstruct')
const LRU = require('lru-cache')
const hash = require('hash-sum')
const { SourceMapGenerator } = require('source-map')

const assertType = require('./utils/assert-type')

const cache = LRU(100)
const splitRE = /\r?\n/g
const emptyRE = /^(?:\/\/)?\s*$/

const Config = struct(
  {
    needMap: 'boolean?',
    needCSSMap: 'boolean?'
  },
  {
    needMap: true,
    needCSSMap: false
  }
)

module.exports = function parse (content, filename, config) {
  assertType({ content, filename }, 'string')
  config = Config(config)

  const cacheKey = hash(filename + content)
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  const output = compiler.parseComponent(content, { pad: 'line' })
  if (config.needMap) {
    if (output.script && !output.script.src) {
      output.script.map = generateSourceMap(
        filename,
        content,
        output.script.content
      )
    }
    if (config.needCSSMap && output.styles) {
      output.styles.forEach(style => {
        if (!style.src) {
          style.map = generateSourceMap(
            filename,
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
