const compiler = require('vue-template-compiler')
const transpile = require('vue-template-es2015-compiler')
const defaults = require('lodash.defaultsdeep')
const { js_beautify: beautify } = require('js-beautify')

const transformRequire = require('./modules/transform-require')
const assertType = require('../utils/assert-type')

module.exports = function compileTemplate (template, filename, config) {
  assertType({ filename }, 'string')
  assertType({ descriptor: template.descriptor }, 'object')
  assertType({ code: template.code }, 'string')
  config = defaults(
    config,
    {
      isServer: false,
      esModule: true,
      isProduction: true,
      optimizeSSR: true,
      buble: {
        transforms: {
          stripWith: true
        }
      },
      options: {
        preserveWhitespace: true,
        modules: []
      },
      plugins: []
    }
  )

  const options = config.options

  options.modules = options.modules.concat(config.plugins)
  options.modules.push(transformRequire(config.transformToRequire))

  const compile = (config.isServer && config.optimizeSSR !== false && compiler.ssrCompile) ? compiler.ssrCompile : compiler.compile
  const compiled = compile(template.code, options)
  const output = {
    errors: compiled.errors,
    tips: compiled.tips
  }

  if (output.errors && output.errors.length) {
    output.code = `function render () {}\nvar staticRenderFns = []`
  } else {
    output.code = transpile(
      'var render = ' + toFunction(compiled.render) + '\n' +
      'var staticRenderFns = [' + compiled.staticRenderFns.map(toFunction).join(',') + ']',
      config.buble
    )

    // mark with stripped (this enables Vue to use correct runtime proxy detection)
    if (
      !config.isProduction &&
      config.buble.transforms.stripWith !== false
    ) {
      output.code += `render._withStripped = true\n`
    }
  }
  const __exports__ = `{ render: render, staticRenderFns: staticRenderFns }`
  if (config.esModule !== true) {
    output.code += `\nmodule.exports = ${__exports__}`
  } else {
    output.code += `\nexport default ${__exports__}`
  }

  return output
}

function toFunction (code) {
  return 'function () {' + beautify(code, {
    indent_size: 2 // eslint-disable-line camelcase
  }) + '}'
}
