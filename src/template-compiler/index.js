const pad = require('../utils/pad')
const prettier = require('prettier')
const { struct } = require('superstruct')
const defaultsdeep = require('lodash.defaultsdeep')
const transpile = require('vue-template-es2015-compiler')
const compiler = require('vue-template-compiler/build.js')

const assertType = require('../utils/assert-type')
const transformSrcset = require('./modules/transform-srcset')
const transformRequire = require('./modules/transform-require')
const { Config, Source } = require('../schema/template-compiler')

const defaults = {
  isServer: false,
  esModule: true,
  isProduction: true,
  optimizeSSR: true,
  buble: {
    transforms: {
      stripWith: true,
      stripWithFunctional: false
    }
  },
  options: {
    preserveWhitespace: true,
    comments: true,
    modules: [],
    directives: []
  },
  plugins: []
}

module.exports = function compileTemplate (template, filename, config) {
  assertType({ filename }, 'string')
  template = Source(template)
  config = Config(config, defaults)

  const options = config.options

  options.scopeId = config.scopeId
  options.modules = [].concat(options.modules || [], config.plugins || [], [
    transformRequire(config.transformToRequire),
    transformSrcset
  ])

  const compile =
    config.isServer && config.optimizeSSR !== false && compiler.ssrCompile
      ? compiler.ssrCompile
      : compiler.compile
  const compiled = compile(template.code, options)
  const output = {
    errors: compiled.errors,
    tips: compiled.tips
  }

  if (output.errors && output.errors.length) {
    output.code = `function render () {}\nvar staticRenderFns = []\n`
  } else {
    const stripWithFunctional =
      template.descriptor.attrs && template.descriptor.attrs.functional

    config.buble.transforms.stripWithFunctional = stripWithFunctional

    output.code = transpile(
      'var render = ' +
        toFunction(compiled.render, stripWithFunctional) +
        '\n' +
        'var staticRenderFns = [' +
        compiled.staticRenderFns
          .map(it => toFunction(it, stripWithFunctional))
          .join(',') +
        ']\n',
      config.buble
    )

    // mark with stripped (this enables Vue to use correct runtime proxy detection)
    if (!config.isProduction && config.buble.transforms.stripWith !== false) {
      output.code += `render._withStripped = true\n`
    }
  }
  const __exports__ = `{ render: render, staticRenderFns: staticRenderFns }`
  if (config.esModule !== true) {
    output.code += `\nmodule.exports = ${__exports__}`
  } else {
    output.code += `\nexport default ${__exports__}`

    // remove all require statements
    const imports = []
    output.code = output.code.replace(/\brequire\("([^"]+)"\)/g, (_, name) => {
      let index = imports.indexOf(name)
      if (index === -1) {
        index = imports.length
        imports.push(name)
      }
      const ref = `__vue_template_import_${index}__`

      return ref
    })
    output.code =
     imports.map((name, i) => `import __vue_template_import_${i}__ from '${name}'`).join('\n') +
     '\n\n' + output.code
  }

  return output
}

function toFunction (code, stripWithFunctional) {
  return `function (${stripWithFunctional ? '_h,_vm' : ''}) {\n  ${
    pad(prettier.format(code))
  }}`
}
