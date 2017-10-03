const postcss = require('postcss')

const trim = require('./plugins/trim')
const scopeId = require('./plugins/scope-id')

/**
 * Compile SFC style.
 *
 * @param {CompilerSource} style
 * @param {string} filename
 * @param {{plugins: object, options: object, needMap: boolean}} config
 */
function compileStyle (style, filename, config = {}) {
  const plugins = [trim].concat(config.plugins || [])
  const options = Object.assign({
    to: filename,
    from: filename,
    map: false
  }, config.options)

  // source map
  if (config.needMap && !options.map) {
    if (!style.map) {
      throw Error('Previous source map is missing.')
    }

    options.map = {
      inline: false,
      annotation: false,
      prev: style.map
    }
  }

  if (!style.descriptor) {
    throw Error('SFC block descriptor is missing.')
  }

  // add plugin for scoped css rewrite
  if (style.descriptor.scoped) {
    if (typeof (config.scopeId) !== 'string') {
      throw Error(`'scopeId' is required to compile scoped style.`)
    }
    plugins.push(scopeId({ id: config.scopeId }))
  }

  return postcss(plugins).process(style.code, options)
}

module.exports =
/**
 * Compile SFC styles.
 *
 * @param {CompilerSource[]} styles
 * @param {string} filename
 * @param {{plugins: object, options: object, needMap: boolean}} config
 */
function compileStyles (styles, filename, config) {
  return Promise.all(styles.map(style => compileStyle(style, filename, config)))
}
