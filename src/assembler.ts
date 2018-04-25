import { SFCCompiler, DescriptorCompileResult } from './compiler'

export interface AssembleSource {
  filename: string
  script?: { source: string; map?: any }
  template?: { source: string; functional?: boolean }
  styles: Array<{ source: string; scoped?: boolean; map?: any }>
  scopeId: string
}

export interface AssembleResults {
  code: string
  map?: any
}

export function assemble(
  compiler: SFCCompiler,
  filename: string,
  result: DescriptorCompileResult
): AssembleResults {
  return assembleFromSource(compiler, {
    filename,
    scopeId: result.scopeId,
    script: result.script && { source: result.script.code },
    template: result.template && { source: result.template.code, functional: result.template.functional },
    styles: result.styles.map(style => ({
      source: style.code,
      media: style.media,
      scoped: style.scoped,
      moduleName: style.moduleName,
      module: style.module
    }))
  })
}

export function assembleFromSource(
  compiler: SFCCompiler,
  { filename, script, template, styles, scopeId }: AssembleSource
): AssembleResults {
  script = script || { source: 'export default {}' }
  template = template || { source: '' }

  const hasScopedStyle = styles.some(style => style.scoped === true)
  const hasStyle = styles.length > 0
  const e = (any: any): string => JSON.stringify(any)
  const code = `
/* template */
${template.source
    .replace('var render =', 'var __vue_render__ =')
    .replace('var staticRenderFns =', 'var __vue_staticRenderFns__ =')
    .replace('render._withStripped =', '__vue_render__._withStripped =')}
const __vue_template__ = ${
    template.source.includes('var render =')
      ? '{ render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ }'
      : '{ render() {} }'
  }
/* style */
const __vue_inject_styles__ = ${e(hasStyle)} ? function (context) {
${styles.map(
    (style, index) => `context(${e(scopeId + ':' + index)}, ${e(style)})\n`
  )}
} : undefined
/* script */
${script.source.replace(/export default/, 'const __vue_script__ =')}
/* scoped */
const __vue_scope_id__ = ${e(hasScopedStyle)} ? ${e(scopeId)} : undefined
/* functional template */
const __vue_is_functional_template__ = ${e(template.functional)}
/* component normalizer */
function __vue_normalize__(template, inject, script, scope, functional) {
  const component = script || {}

  if (!${e(compiler.template.isProduction)}) {
    component.__file = ${e(filename)}
  }

  if (!component.render) {
    component.render = template.render
    component.staticRenderFns = template.staticRenderFns
    component._compiled = true

    if (functional) component.functional = true
  }

  component._scopeId = scope

  if (${e(hasStyle)}) {
    const call_inject = function(context) {
      inject((id, style) => {
        if (style.moduleName) {
          if (${e(!compiler.template.isProduction)} && Object.prototype.hasOwnProperty.call(this, style.moduleName)) {
            console.log('CSS module name (' + style.moduleName + ') is reserved.')
          } else Object.defineProperty(this, style.moduleName, {
            value: style.module
          })
        }
        let css = style.source
        if (style.map) {
          // https://developer.chrome.com/devtools/docs/javascript-debugging
          // this makes source maps inside style tags work properly in Chrome
          css += '\\n/*# sourceURL=' + style.map.sources[0] + ' */'
          // http://stackoverflow.com/a/26603875
          css +=
            '\\n/*# sourceMappingURL=data:application/json;base64,' +
            window.btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) +
            ' */'
        }
        if (${e(compiler.template.optimizeSSR)}) {
          // 2.3 injection
          context =
            context || // cached call
            (this.$vnode && this.$vnode.ssrContext) || // stateful
            (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
          // 2.2 with runInNewContext: true
          if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
            context = __VUE_SSR_CONTEXT__
          }
          if (!context.hasOwnProperty('styles')) {
            function renderStyles (styles) {
              let css = ''
              for (const key in styles) {
                const it = styles[key]
                css +=
                  '<style data-vue-ssr-id="' + it.ids.join(' ') + '"' +
                  (it.media ? ' media="' + it.media + '"' : '') +
                  '>' +
                  it.source +
                  '</style>'
              }
              return css
            }
            Object.defineProperty(context, 'styles', {
              enumerable: true,
              get: () => renderStyles(context._styles)
            })
            // expose renderStyles for vue-server-renderer (vuejs/#6353)
            context._renderStyles = renderStyles
          }
          const styles = context._styles || (context._styles = {})
          const groupId = ${e(
            compiler.template.isProduction
          )} ? style.media || 'default' : id
          const target = styles[groupId]
          if (target) {
            if (target.ids.indexOf(id) < 0) {
              target.ids.push(id)
              target.source += '\\n' + style.source
            }
          } else {
            styles[groupId] = {
              ids: [id],
              style: style.source,
              media: style.media
            }
          }
        } else {
          const head = document.head || document.getElementsByTagName('head')[0]
          const isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase())
          const styleElement = document.querySelector('style[data-vue-ssr-id~="' + id + '"]')
          if (styleElement) {
            // SSR styles are present.
            return
          }

          if (isOldIE) {
            const indexKey = '__vue_style_singleton_counter__'
            const textKey = '__vue_style_text__'
            window[indexKey] = window[indexKey] || 0
            const styles = window[textKey] = window[textKey] || []
            const index = ++window[indexKey]
            let styleElement = document.querySelector('style[data-vue-style-singleton=' + (style.media || '""') + ']')
            if (!styleElement) {
              styleElement = document.createElement('style')
              styleElement.setAttribute('data-vue-style-singleton', style.media || '')
              styleElement.type = 'text/css'
              head.appendChild(style)
            }
            if (styleElement.styleSheet) {
              styles[index] = css
              styleElement.styleSheet.cssText = style.filter(Boolean).join('\\n')
            } else {
              const cssNode = document.createTextNode(css)
              const childNodes = styleElement.childNodes
              if (childNodes[index]) styleElement.removeChild(childNodes[index])
              if (childNodes.length) {
                styleElement.insertBefore(cssNode, childNodes[index])
              } else {
                styleElement.appendChild(cssNode)
              }
            }
          } else {
            const styleElement = document.createElement('style')
            styleElement.type = 'text/css'
            style.media && styleElement.setAttribute('media', style.media)
            head.appendChild(styleElement)
            if (style.styleSheet) {
              styleElement.styleSheet.cssText = css
            } else {
              styleElement.appendChild(document.createTextNode(css))
            }
          }
        }
      })
      if (context && context._registeredComponents) {
        context._registeredComponents.add(scope)
      }
    }
    if (${e(compiler.template.optimizeSSR)}) {
      component._ssrRegister = call_inject
    }
    if (component.functional) {
      const render = component.render
      component.render = function renderWithInjection (h, ctx) {
        call_inject.call(this, ctx)

        return render(h, ctx)
      }
    } else {
      const name = 'beforeCreate'
      component[name] = [call_inject].concat(component[name])
    }
  }

  return component
}

export default __vue_normalize__(
  __vue_template__,
  __vue_inject_styles__,
  __vue_script__,
  __vue_scope_id__,
  __vue_is_functional_template__
)
`
  // let map

  // if (script.map) {
  //   const startPointer = '/* script */\n'
  //   const startIndex = code.indexOf(startPointer) + startPointer.length
  //   const endIndex = code.indexOf('/* scoped */\n') - 1
  //   const startLine = code.substr(0, startIndex).split('\n').length
  //   const endLine = code.substr(0, endIndex).split('\n').length

  //   // generate script source map.
  // }

  return { code }
}
