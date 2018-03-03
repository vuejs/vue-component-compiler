const postcss = require('postcss')
const { default: cssModules } = require('postcss-modules-sync')

const trim = require('./plugins/trim')
const scopeId = require('./plugins/scope-id')
const assertType = require('../utils/assert-type')
const { Config, Source } = require('../schema/style-compiler')

const defaults = {
  async: false,
  needMap: true,
  onWarn: () => message => console.warn(message),
  options: {},
  plugins: []
}

module.exports = function compileStyle (style, filename, config) {
  assertType({ filename }, 'string')
  style = Source(style)
  config = Config(config, defaults)

  const plugins = [trim].concat(config.plugins)
  const options = Object.assign(
    { to: filename, from: filename },
    config.options
  )

  // source map
  if (config.needMap) {
    options.map = {
      inline: false,
      annotation: false,
      prev: style.map || false
    }
  }

  // add plugin for scoped css rewrite
  if (style.descriptor.scoped) {
    if (typeof config.scopeId !== 'string') {
      throw Error(`'scopeId' is required to compile scoped style.`)
    }
    plugins.push(scopeId({ id: config.scopeId }))
  }

  let modules = {}
  if (style.descriptor.module) {
    plugins.push(
      cssModules({
        generateScopedName:
          config.generateScopedName || '[local]-[hash:base64:10]',
        getJSON: output => {
          modules = output
        }
      })
    )
  }

  const output = postcss(plugins).process(style.code, options)
  const prepare = result => {
    const output = { code: result.css, modules }

    if (config.needMap) {
      output.map = result.map
    }
    result.warnings().forEach(warning => config.onWarn(warning))

    return output
  }

  return config.async ? output.then(prepare) : prepare(output)
}
