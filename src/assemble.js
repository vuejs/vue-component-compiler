const pad = require('./utils/pad')
const _s = require('./utils/stringify')
const assertType = require('./utils/assert-type')
const importStatement = require('./utils/import-statement')

const { Config, Source } = require('./schema/assemble')

const STYLE_IDENTIFIER = '__vue_inject_style__'
const COMPONENT_IDENTIFIER = '__vue_component__'
const STYLE_INJECTOR_IDENTIFIER = '__vue_style_injector__'
const NORMALIZE_COMPONENT_IDENTIFIER = '__vue_normalize_component__'
const EXPORT_REGEX = /(export[\s\r\n]+default|module[\s\r\n]*\.exports[^=]*=)[\s\r\n]*/

function inlineStyle (name, style, config) {
  let output = `var ${name} = ${style.modules ? _s(style.modules) : '{}'}\n`

  output +=
    `${name}.__inject__ = function (context) {\n` +
    `  ${STYLE_INJECTOR_IDENTIFIER}(${_s(config.shortFilePath)}, [[${_s(
      config.shortFilePath
    )}, ${_s(style.code)}, ${_s(style.descriptor.attrs.media)}, ${_s(
      style.map
    )}]], ${config.isProduction}, context)\n` +
    `}\n`

  return output
}

function inlineTemplate (render, config) {
  const lines = render.code.split('\n')
  let i = 0
  while (lines[i].startsWith('import ')) {
    i += 1
  }

  const imports = lines.slice(0, i).join('\n')
  const code = lines.slice(i).join('\n')

  return (
    `\n/* template */\n` +
    imports + '\n' +
    `var __vue_template__ = (function () {\n${pad(
      code.replace(EXPORT_REGEX, 'return ').trim()
    )}})()\n`
  )
}

const defaults = {
  esModule: true,
  require: {
    normalizeComponent:
      'vue-component-compiler/src/runtime/normalize-component',
    injectStyleClient:
      'vue-component-compiler/src/runtime/inject-style-client',
    injectStyleServer:
      'vue-component-compiler/src/runtime/inject-style-server'
  },
  isServer: false,
  isProduction: true,
  hasStyleInjectFn: false,
  onWarn: () => message => console.warn(message)
}

module.exports = function assemble (source, filename, config) {
  assertType({ filename }, 'string')
  config = Config(config, defaults)
  source = Source(source)

  let output = ''
  const { script = {}, render = {}, styles = [], customBlocks = [] } = source
  const hasScoped = styles.some(style => style.descriptor.scoped)

  if (styles.length) {
    const cssModules = {}
    let styleInjectionCode = ''

    output += 'var __vue_css_modules__ = {}\n'

    // Import style injector.
    output += importStatement(
      config.isServer
        ? config.require.injectStyleServer
        : config.require.injectStyleClient,
      { name: STYLE_INJECTOR_IDENTIFIER, esModule: config.esModule }
    )
    styles.forEach((style, i) => {
      const IMPORT_NAME = `__vue_style_${i}__`
      const moduleName =
        style.descriptor.module === true ? '$style' : style.descriptor.module
      const needsNamedImport =
        config.hasStyleInjectFn || typeof moduleName === 'string'
      const runInjection = `${IMPORT_NAME} && ${IMPORT_NAME}.__inject__ && ${IMPORT_NAME}.__inject__(context)\n`

      if (typeof style.code === 'string') {
        output += inlineStyle(IMPORT_NAME, style, config)
        styleInjectionCode += runInjection
      } else {
        output += importStatement(style.id, {
          esModule: config.esModule,
          name: IMPORT_NAME,
          noIdentifier: !needsNamedImport
        })
        if (config.hasStyleInjectFn) {
          styleInjectionCode += runInjection
        }
      }

      if (moduleName) {
        if (moduleName in cssModules) {
          config.onWarn({
            message: 'CSS module name "' + moduleName + '" is not unique!'
          })
        } else {
          cssModules[moduleName] = true
          styleInjectionCode +=
            `__vue_css_modules__[${_s(moduleName)}] = ${IMPORT_NAME}\n` +
            `Object.defineProperty(this, ${_s(
              moduleName
            )}, { get: function () { return __vue_css_modules__[${_s(
              moduleName
            )}] }})\n`
        }
      }
    })
    output +=
      `function ${STYLE_IDENTIFIER} (context) {\n` +
      pad(styleInjectionCode) +
      `}\n`
  }

  // we require the component normalizer function, and call it like so:
  // normalizeComponent(
  //   scriptExports,
  //   compiledTemplate,
  //   injectStyles,
  //   scopeId,
  //   moduleIdentifier (server only)
  // )
  output += importStatement(config.require.normalizeComponent, {
    esModule: config.esModule,
    name: NORMALIZE_COMPONENT_IDENTIFIER
  })
  // <script>
  if (typeof script.code === 'string') {
    output +=
      '\n/* script */\n' +
      script.code.replace(EXPORT_REGEX, '\nvar __vue_script__ = ') +
      '\n'
  } else {
    output += importStatement(script.id, {
      esModule: config.esModule,
      type: 'script'
    })
    if (script.id && config.esModule) {
      output += `export * from ${_s(script.id)}\n`
    }
  }

  // <template>
  if (typeof render.code === 'string') {
    output += inlineTemplate(render, config)
  } else {
    output += importStatement(render.id, {
      esModule: config.esModule,
      type: 'template'
    })
  }

  // template functional
  output += '\n/* template functional */\n'
  output +=
    'var __vue_template_functional__ = ' +
    (render.descriptor &&
    render.descriptor.attrs &&
    render.descriptor.attrs.functional
      ? 'true'
      : 'false') +
    '\n'

  // style
  output += '\n/* styles */\n'
  output +=
    'var __vue_styles__ = ' + (styles.length ? STYLE_IDENTIFIER : 'null') + '\n'

  // scopeId
  output += '\n/* scopeId */\n'
  output +=
    'var __vue_scopeId__ = ' + (hasScoped ? _s(config.scopeId) : 'null') + '\n'

  // moduleIdentifier (server only)
  output += '\n/* moduleIdentifier (server only) */\n'
  output +=
    'var __vue_module_identifier__ = ' +
    (config.isServer ? _s(config.moduleIdentifier) : 'null') +
    '\n'

  // close normalizeComponent call
  output +=
    `\nvar ${COMPONENT_IDENTIFIER} = ${NORMALIZE_COMPONENT_IDENTIFIER}(\n` +
    '  __vue_script__,\n' +
    '  __vue_template__,\n' +
    '  __vue_template_functional__,\n' +
    '  __vue_styles__,\n' +
    '  __vue_scopeId__,\n' +
    '  __vue_module_identifier__\n' +
    ')\n'

  // development-only code
  if (!config.isProduction) {
    // add filename in dev
    output += `${COMPONENT_IDENTIFIER}.options.__file = ${_s(
      config.shortFilePath
    )}\n`
  }

  if (customBlocks.length) {
    output += '\n/* Custom Blocks */\n'
    customBlocks.forEach((customBlock, i) => {
      const name = `__vue_custom_block_${customBlock.descriptor.type}_${i}__`
      output += importStatement(customBlock.id, {
        esModule: config.esModule,
        name
      })
      output +=
        `if (${name} && ${name}.__esModule) ${name} = ${name}.__esModule\n` +
        `if (typeof ${name} === 'function') { ${name}(${COMPONENT_IDENTIFIER}) }\n`
    })
  }

  if (config.esModule) {
    output += `\nexport default ${COMPONENT_IDENTIFIER}.options\n`
  } else {
    output += `\nmodule.exports = ${COMPONENT_IDENTIFIER}.options\n`
  }

  return output
}
