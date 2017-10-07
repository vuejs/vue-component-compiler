const compiler = require('vue-template-compiler')
const transpile = require('vue-template-es2015-compiler')
const defaults = require('lodash.defaultsdeep')
const { js_beautify: beautify } = require('js-beautify')

const transformRequire = require('./modules/transform-require')

module.exports = function compileTemplate (template, filename, config) {
  config = defaults(
    config,
    {
      isHot: false,
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
  const vueHotReloadAPI = (config.require && config.require.vueHotReloadAPI) || 'vue-hot-reload-api'

  if (output.errors && output.errors.length) {
    output.code = config.esModule === true
      ? `export function render () {}\nexport var staticRenderFns = []`
      : 'module.exports={render:function(){},staticRenderFns:[]}'
  } else {
    output.code = transpile(
      'var render = ' + toFunction(compiled.render) + '\n' +
      'var staticRenderFns = [' + compiled.staticRenderFns.map(toFunction).join(',') + ']',
      config.buble
    ) + '\n'

    // mark with stripped (this enables Vue to use correct runtime proxy detection)
    if (
      !config.isProduction &&
      config.buble.transforms.stripWith !== false
    ) {
      output.code += `render._withStripped = true\n`
    }

    const __exports__ = `{ render: render, staticRenderFns: staticRenderFns }`
    output.code += config.esModule === true
      ? `export default ${__exports__}`
      : `module.exports = ${__exports__}`

    if (!config.isProduction && config.isHot) {
      output.code +=
        '\nif (module.hot) {\n' +
        '  module.hot.accept()\n' +
        '  if (module.hot.data) {\n' +
        `     require(${JSON.stringify(vueHotReloadAPI)}).rerender(${JSON.stringify(options.scopeId)}, module.exports)\n` +
        '  }\n' +
        '}'
    }
  }

  return Promise.resolve(output)
}

function toFunction (code) {
  return 'function () {' + beautify(code, {
    indent_size: 2 // eslint-disable-line camelcase
  }) + '}'
}
