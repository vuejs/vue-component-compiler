const defaults = require('lodash.defaultsdeep')
const hash = require('hash-sum')

const DISPOSED = 'disposed'
const INJECT_STYLE_FN = 'injectStyle'
const CSS_MODULES = 'cssModules'

function _s (any) {
  return JSON.stringify(any)
}

// eslint-disable-next-line camelcase
function __vue_type__ (type, id, esModule, addPrefix = true) {
  let output = addPrefix ? `\n/* ${type} */\n` : ''
  if (id) {
    if (esModule) {
      output += `import __vue_${type}__ from ${_s(id)}\n`
    } else {
      output += `var __vue_${type}__ = require(${_s(id)})\n`
    }
  } else {
    output += `var __vue_${type}__ = null\n`
  }
  return output
}

module.exports = function assemble (source, filename, config) {
  config = defaults({}, config, {
    esModule: true,
    shortFilePath: filename,
    require: {
      vueHotReloadAPI: 'vue-hot-reload-api',
      normalizeComponent: 'vue-component-compiler/src/normalize-component.js'
    },
    scopeId: null,
    moduleIdentifier: config.moduleIdentifier || hash(_s({ filename, config })), // require for server. TODO: verify this is correct.
    isHot: false,
    isServer: false,
    isProduction: true,
    isInjectable: false,
    hasStyleInjectFn: false,
    onWarn: message => console.warn(message)
  })

  let output = ''
  const { script, render, styles, customBlocks } = source
  const needsHotReload = !config.isProduction && config.isHot
  const hasScoped = styles.some(style => style.descriptor.scoped)

  if (config.isInjectable) config.esModule = false

  if (needsHotReload) output += `var ${DISPOSED} = false\n`

  let cssModules
  if (styles.length) {
    let styleInjectionCode = `function ${INJECT_STYLE_FN} (ssrContext) {\n`

    if (needsHotReload) styleInjectionCode += `if (${DISPOSED}) return`
    if (config.isServer) styleInjectionCode += '  var i\n'

    styles.forEach((style, i) => {
      const invokeStyle = config.isServer && config.hasStyleInjectFn
        ? code => `  ;i=${code},i.__inject__&&i.__inject__(ssrContext),i)\n`
        : code => `  ${code}\n`

      const moduleName = (style.descriptor.module === true) ? '$style' : style.descriptor.module
      const requireString = `require(${_s(style.id)})`

      if (moduleName) {
        if (!cssModules) {
          cssModules = {}
          if (needsHotReload) {
            output += `var ${CSS_MODULES} = {}\n`
          }
        }
        if (moduleName in cssModules) {
          config.onWarn({
            message: 'CSS module name "' + moduleName + '" is not unique!'
          })
          styleInjectionCode += invokeStyle(requireString)
        } else {
          cssModules[moduleName] = true
          const MODULE_KEY = _s(moduleName)

          if (!needsHotReload) {
            styleInjectionCode += invokeStyle(`this[${MODULE_KEY}] = ${requireString}`)
          } else {
            styleInjectionCode +=
              invokeStyle(`${CSS_MODULES}[${MODULE_KEY}] = ${requireString}`) +
              `Object.defineProperty(this, ${MODULE_KEY}, { get: function () { return ${CSS_MODULES}[${MODULE_KEY}] }})\n`

            output +=
              `module.hot && module.hot.accept([${_s(style.hotPath || style.id)}], function () {\n` +
              // 1. check if style has been injected
              `  var oldLocals = ${CSS_MODULES}[${MODULE_KEY}]\n` +
              `  if (!oldLocals) return\n` +
              // 2. re-import (side effect: updates the <style>)
              `  var newLocals = ${requireString}\n` +
              // 3. compare new and old locals to see if selectors changed
              `  if (JSON.stringify(newLocals) === JSON.stringify(oldLocals)) return\n` +
              // 4. locals changed. Update and force re-render.
              `  ${CSS_MODULES}[${MODULE_KEY}] = newLocals\n` +
              `  require(${_s(config.require.vueHotReloadAPI)}).rerender(${_s(config.moduleId)})\n` +
              `})\n`
          }
        }
      } else {
        styleInjectionCode += invokeStyle(requireString)
      }
    })

    styleInjectionCode += '}\n'
    output += styleInjectionCode
  }

  // we require the component normalizer function, and call it like so:
  // normalizeComponent(
  //   scriptExports,
  //   compiledTemplate,
  //   injectStyles,
  //   scopeId,
  //   moduleIdentifier (server only)
  // )
  output += config.esModule
    ? `import normalizeComponent from ${_s(config.require.normalizeComponent)}\n`
    : `var normalizeComponent = require(${_s(config.require.normalizeComponent)})\n`
  // <script>
  output += __vue_type__('script', script.id, config.esModule)
  if (config.isInjectable) {
    output +=
      `if (__vue_script__) { __vue_script__ = __vue_script__(injections) }\n`
  }

  // <template>
  output += __vue_type__('template', render.id, config.esModule)

  // style
  output += '\n/* styles */\n'
  output += 'var __vue_styles__ = ' + (styles.length ? 'injectStyle' : 'null') + '\n'

  // scopeId
  output += '\n/* scopeId */\n'
  output += 'var __vue_scopeId__ = ' + (hasScoped ? _s(config.scopeId) : 'null') + '\n'

  // moduleIdentifier (server only)
  output += '\n/* moduleIdentifier (server only) */\n'
  output += 'var __vue_module_identifier__ = ' + (config.isServer ? _s(config.moduleIdentifier) : 'null') + '\n'

  // close normalizeComponent call
  output += '\nvar Component = normalizeComponent(\n' +
  '  __vue_script__,\n' +
  '  __vue_template__,\n' +
  '  __vue_styles__,\n' +
  '  __vue_scopeId__,\n' +
  '  __vue_module_identifier__\n' +
  ')\n'

  // development-only code
  if (!config.isProduction) {
    // add filename in dev
    output += `Component.options.__file = ${_s(config.shortFilePath)}\n`
    // check named exports
    output +=
      `if (Component.esModule && Object.keys(Component.esModule).some(function (key) {\n` +
      `  return key !== "default" && key.substr(0, 2) !== "__"\n` +
      `})) {\n` +
      `  console.error("named exports are not supported in *.vue files.")\n` +
      `}\n`
    // check functional components used with templates
    if (render.id) {
      output +=
        'if (Component.options.functional) {\n' +
        '  console.error("' +
          '[vue-loader] ' + filename + ': functional components are not ' +
          'supported with templates, they should use render functions.' +
        '")\n}\n'
    }
  }

  if (customBlocks.length) {
    let addedPrefix = false
    customBlocks.forEach((customBlock, i) => {
      const TYPE = `customBlock_${customBlock.descriptor.type}_${i}`
      const BLOCK = `__vue_${TYPE}__`
      if (!addedPrefix) output += `\n/* Custom Blocks */\n`
      output += __vue_type__(TYPE, customBlock.id, config.esModule, false)
      output += `if (typeof ${BLOCK} === 'function') { ${BLOCK}(Component) }\n`
      addedPrefix = true
    })
  }

  if (!config.isInjectable) {
    if (needsHotReload) {
      output +=
        `\n/* hot reload */\n` +
        `if (module.hot) { (function () {\n` +
        `  var hotAPI = require(${_s(config.require.vueHotReloadAPI)})\n` +
        `  hotAPI.install(require('vue'), false)\n` +
        `  if (!hotAPI.compatible) return\n` +
        `  module.hot.accept()\n` +
        `  if (!module.hot.data) {\n` +
        // initial insert
        `    hotAPI.createRecord(${_s(config.moduleId)}, Component.options)\n` +
        `  } else {\n`
        // update
      if (cssModules) {
        output +=
        `    if (module.hot.data.cssModules && Object.keys(module.hot.data.cssModules) !== Object.keys(cssModules)) {\n` +
        `      delete Component.options._Ctor\n` +
        `    }\n`
      }

      output +=
        `    hotAPI.reload(${_s(config.moduleId)}, Component.options)\n` +
        `  }\n`

      // dispose
      output +=
        `  module.hot.dispose(function (data) {\n` +
        (cssModules ? `    data.cssModules = cssModules\n` : '') +
        `    disposed = true\n` +
        `  })\n`

      output +=
        `})()}\n`
    }

    if (config.esModule) {
      output += `\nexport default Component.options\n`
    } else {
      output += `\nmodule.exports = Component.exports\n`
    }
  } else {
    output =
      `\n/* dependency injection */\n` +
      `module.exports = function (injections) {\n${pad(output)}\n` +
      `  return Component.exports\n` +
      `}\n`
  }

  return output
}

function pad (content) {
  return content.split('\n').map(line => '  ' + line).join('\n')
}
