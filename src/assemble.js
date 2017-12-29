const defaults = require('lodash.defaultsdeep')
const { js_beautify: beautify } = require('js-beautify')

const NORMALIZE_COMPONENT_IDENTIFIER = '__vue_normalize_component__'
const STYLE_INJECTOR_IDENTIFIER = '__vue_style_injector__'
const STYLE_IDENTIFIER = '__vue_inject_style__'
const COMPONENT_IDENTIFIER = '__vue_component__'

function _s (any) {
  return JSON.stringify(any)
}

// eslint-disable-next-line camelcase
function importStatement (id, { type, name, esModule, noIdentifier = false }) {
  const header = type ? `\n/* ${type} */\n` : ''
  name = name || `__vue_${type}__`

  if (!id) return header + `var ${name} = null\n`

  if (esModule) {
    return header + (
      noIdentifier ? `import ${_s(id)}\n` : `import ${name} from ${_s(id)}\n`
    )
  }

  return header + (
    noIdentifier ? `require(${_s(id)})\n` : `var ${name} = require(${_s(id)})\n`
  )
}

function inlineStyle (name, style, config) {
  let output = `var ${name} = {}\n` // TODO: Inline css modules if required.

  output += `${name}.__inject__ = function (context) {\n` +
    ` ${STYLE_INJECTOR_IDENTIFIER}(${_s(config.shortFilePath)}, ${_s(style.content)}, ${config.isProduction}, context)\n` +
    `}\n`

  return output
}

module.exports = function assemble (source, filename, config) {
  config = defaults({}, config, {
    esModule: true,
    shortFilePath: filename,
    require: {
      normalizeComponent: 'vue-component-compiler/src/runtime/normalize-component',
      injectStyleClient: 'vue-component-compiler/src/runtime/inject-style-client',
      injectStyleServer: 'vue-component-compiler/src/runtime/inject-style-server'
    },
    scopeId: null,
    moduleIdentifier: null,
    isServer: false,
    isProduction: true,
    hasStyleInjectFn: false,
    onWarn: message => console.warn(message)
  })

  // console.log(config)
  // console.log('-----------------------------')

  let output = ''
  const { script = {}, render = {}, styles = [], customBlocks = [] } = source
  const hasScoped = styles.some(style => style.descriptor.scoped)

  if (styles.length) {
    const cssModules = {}
    let inlineInjectFunctionAdded = false
    let styleInjectionCode = ''
    styles.forEach((style, i) => {
      const IMPORT_NAME = `__vue_style_${i}__`
      const moduleName = (style.descriptor.module === true) ? '$style' : style.descriptor.module
      const needsNamedImport = config.hasStyleInjectFn || typeof moduleName === 'string'
      const runInjection = `${IMPORT_NAME} && ${IMPORT_NAME}.__inject__ && ${IMPORT_NAME}.__inject__(context)\n`

      if (typeof style.content === 'string') {
        if (!inlineInjectFunctionAdded) {
          output += importStatement(
            config.isServer ? config.require.injectStyleServer : config.require.injectStyleClient,
            { name: STYLE_INJECTOR_IDENTIFIER, esModule: config.esModule }
          )
          inlineInjectFunctionAdded = true
        }
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
          styleInjectionCode += `this[${_s(moduleName)}] = ${IMPORT_NAME}\n`
        }
      }
    })
    output += `function ${STYLE_IDENTIFIER} (context) {\n` + pad(styleInjectionCode) + `}\n`
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
  if (typeof script.content === 'string') {
    output += '\n/* script */\n' + script.content.replace(/export[\s\r\n]+default/, '\nvar __vue_script__ = ') + '\n'
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
  if (typeof render.content === 'string') {
    output += `\n/* template */\n` +
      `var __vue_template__ = (${
        beautify(render.content, {
          indent_size: 2 // eslint-disable-line camelcase
        })
      })\n`
  } else {
    output += importStatement(render.id, {
      esModule: config.esModule,
      type: 'template'
    })
  }

  // style
  output += '\n/* styles */\n'
  output += 'var __vue_styles__ = ' + (styles.length ? STYLE_IDENTIFIER : 'null') + '\n'

  // scopeId
  output += '\n/* scopeId */\n'
  output += 'var __vue_scopeId__ = ' + (hasScoped ? _s(config.scopeId) : 'null') + '\n'

  // moduleIdentifier (server only)
  output += '\n/* moduleIdentifier (server only) */\n'
  output += 'var __vue_module_identifier__ = ' + (config.isServer ? _s(config.moduleIdentifier) : 'null') + '\n'

  // close normalizeComponent call
  output += `\nvar ${COMPONENT_IDENTIFIER} = ${NORMALIZE_COMPONENT_IDENTIFIER}(\n` +
  '  __vue_script__,\n' +
  '  __vue_template__,\n' +
  '  __vue_styles__,\n' +
  '  __vue_scopeId__,\n' +
  '  __vue_module_identifier__\n' +
  ')\n'

  // development-only code
  if (!config.isProduction) {
    // add filename in dev
    output += `${COMPONENT_IDENTIFIER}.options.__file = ${_s(config.shortFilePath)}\n`
  }

  if (customBlocks.length) {
    output += '\n/* Custom Blocks */\n'
    customBlocks.forEach((customBlock, i) => {
      const name = `__vue_custom_block_${customBlock.descriptor.type}_${i}__`
      output += importStatement(customBlock.id, {
        esModule: config.esModule,
        name
      })
      output += `if (typeof ${name} === 'function') { ${name}(${COMPONENT_IDENTIFIER}) }\n`
    })
  }

  if (config.esModule) {
    output += `\nexport default ${COMPONENT_IDENTIFIER}.options\n`
  } else {
    output += `\nmodule.exports = ${COMPONENT_IDENTIFIER}.options\n`
  }

  return output
}

function pad (content) {
  return content.trim().split('\n').map(line => '  ' + line).join('\n') + '\n'
}
