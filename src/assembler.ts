import { SFCCompiler, DescriptorCompileResult } from './compiler'

export interface AssembleSource {
  filename: string
  script?: { source: string; map?: any }
  template?: { source: string; functional?: boolean }
  styles: Array<{
    source: string
    scoped?: boolean
    media?: string
    map?: any
    moduleName?: string
    module?: any
  }>
  scopeId: string
}

export interface AssembleResults {
  code: string
  map?: any
}

export interface AssembleOptions {
  normalizer?: string
  styleInjector?: string
  styleInjectorSSR?: string
}

export function assemble(
  compiler: SFCCompiler,
  filename: string,
  result: DescriptorCompileResult,
  options: AssembleOptions = {}
): AssembleResults {
  return assembleFromSource(compiler, options, {
    filename,
    scopeId: result.scopeId,
    script: result.script && { source: result.script.code },
    template: result.template && {
      source: result.template.code,
      functional: result.template.functional
    },
    styles: result.styles.map(style => {
      if (style.errors.length) {
        console.error(style.errors)
      }

      return {
        source: style.code,
        media: style.media,
        scoped: style.scoped,
        moduleName: style.moduleName,
        module: style.module
      }
    })
  })
}

export function assembleFromSource(
  compiler: SFCCompiler,
  options: AssembleOptions,
  { filename, script, template, styles, scopeId }: AssembleSource
): AssembleResults {
  script = script || { source: 'export default {}' }
  template = template || { source: '' }

  const hasScopedStyle = styles.some(style => style.scoped === true)
  const hasStyle = styles.length > 0
  const e = (any: any): string => JSON.stringify(any)
  const createImport = (name: string, value: string) => value.startsWith('~')
    ? `import ${name} from '${value.substr(1)}'`
    : `const ${name} = ${value}`
  const o = e
  const IDENTIFIER = /^[a-z0-9]+$/i

  // language=JavaScript
  const inlineCreateInjector = `function __vue_create_injector__() {
  const head = document.head || document.getElementsByTagName('head')[0]
  const styles = {}
  const isOldIE =
    typeof navigator !== 'undefined' &&
    /msie [6-9]\\\\b/.test(navigator.userAgent.toLowerCase())

  return function addStyle(id, css) {
    if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) return // SSR styles are present.

    const group = isOldIE ? css.media || 'default' : id
    const style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined })

    if (!style.ids.includes(id)) {
      let code = css.source
      let index = style.ids.length

      style.ids.push(id)

      if (${e(compiler.template.isProduction)} && css.map) {
        // https://developer.chrome.com/devtools/docs/javascript-debugging
        // this makes source maps inside style tags work properly in Chrome
        code += '\\n/*# sourceURL=' + css.map.sources[0] + ' */'
        // http://stackoverflow.com/a/26603875
        code +=
          '\\n/*# sourceMappingURL=data:application/json;base64,' +
          btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
          ' */'
      }

      if (isOldIE) {
        style.element = style.element || document.querySelector('style[data-group=' + group + ']')
      }

      if (!style.element) {
        const el = style.element = document.createElement('style')
        el.type = 'text/css'

        if (css.media) el.setAttribute('media', css.media)
        if (isOldIE) {
          el.setAttribute('data-group', group)
          el.setAttribute('data-next-index', '0')
        }

        head.appendChild(el)
      }

      if (isOldIE) {
        index = parseInt(style.element.getAttribute('data-next-index'))
        style.element.setAttribute('data-next-index', index + 1)
      }

      if (style.element.styleSheet) {
        style.parts.push(code)
        style.element.styleSheet.cssText = style.parts
          .filter(Boolean)
          .join('\\n')
      } else {
        const textNode = document.createTextNode(code)
        const nodes = style.element.childNodes
        if (nodes[index]) style.element.removeChild(nodes[index])
        if (nodes.length) style.element.insertBefore(textNode, nodes[index])
        else style.element.appendChild(textNode)
      }
    }
  }
}`
  const createInjector = options.styleInjector
    ? createImport('__vue_create_injector__', options.styleInjector)
    : inlineCreateInjector

  // language=JavaScript
  const inlineCreateInjectorSSR = `function __vue_create_injector_ssr__(context) {
  if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
    context = __VUE_SSR_CONTEXT__
  }

  if (!context) return function () {}

  if (!context.hasOwnProperty('styles')) {
    Object.defineProperty(context, 'styles', {
      enumerable: true,
      get: () => context._styles
    })
    context._renderStyles = renderStyles
  }

  function renderStyles(styles) {
    let css = ''
    for (const {ids, media, parts} of styles) {
      css +=
        '<style data-vue-ssr-id="' + ids.join(' ') + '"' + (media ? ' media="' + media + '"' : '') + '>'
        + parts.join('\\n') +
        '</style>'
    }

    return css
  }

  return function addStyle(id, css) {
    const group = ${e(
      compiler.template.isProduction
    )} ? css.media || 'default' : id
    const style = context._styles[group] || (context._styles[group] = { ids: [], parts: [] })

    if (!style.ids.includes(id)) {
      style.media = css.media
      style.ids.push(id)
      let code = css.source
      if (${e(!compiler.template.isProduction)} && css.map) {
        // https://developer.chrome.com/devtools/docs/javascript-debugging
        // this makes source maps inside style tags work properly in Chrome
        code += '\\n/*# sourceURL=' + css.map.sources[0] + ' */'
        // http://stackoverflow.com/a/26603875
        code +=
          '\\n/*# sourceMappingURL=data:application/json;base64,' +
          btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
          ' */'
      }
      style.parts.push(code)
    }
  }
}`
  const createInjectorSSR = options.styleInjectorSSR
    ? createImport('__vue_create_injector_ssr__', options.styleInjectorSSR)
    : inlineCreateInjectorSSR

  // language=JavaScript
  const inlineNormalizeComponent = `function __vue_normalize__(
  template, style, script,
  scope, functional, moduleIdentifier,
  createInjector, createInjectorSSR
) {
  const component = script || {}

  if (${e(!compiler.template.isProduction)}) {
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
    let hook
    if (${e(compiler.template.optimizeSSR)}) {
      // In SSR.
      hook = function(context) {
        // 2.3 injection
        context =
          context || // cached call
          (this.$vnode && this.$vnode.ssrContext) || // stateful
          (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
        // 2.2 with runInNewContext: true
        if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
          context = __VUE_SSR_CONTEXT__
        }
        // inject component styles
        if (style) {
          style.call(this, createInjectorSSR(context))
        }
        // register component module identifier for async chunk inference
        if (context && context._registeredComponents) {
          context._registeredComponents.add(moduleIdentifier)
        }
      }
      // used by ssr in case component is cached and beforeCreate
      // never gets called
      component._ssrRegister = hook
    }
    else if (style) {
      hook = function(context) {
        style.call(this, createInjector(context))
      }
    }

    if (hook !== undefined) {
      if (component.functional) {
        // register for functional component in vue file
        const originalRender = component.render
        component.render = function renderWithStyleInjection(h, context) {
          hook.call(context)
          return originalRender(h, context)
        }
      } else {
        // inject component registration as beforeCreate hook
        const existing = component.beforeCreate
        component.beforeCreate = existing ? [].concat(existing, hook) : [hook]
      }
    }
  }

  return component
}`
  const normalizeComponent = options.normalizer
    ? createImport('__vue_normalize__', options.normalizer)
    : inlineNormalizeComponent

  // language=JavaScript
  const code = `
/* script */
${script.source.replace(/export default/, 'const __vue_script__ =')}
/* template */
${template.source
    .replace('var render =', 'var __vue_render__ =')
    .replace('var staticRenderFns =', 'var __vue_staticRenderFns__ =')
    .replace('render._withStripped =', '__vue_render__._withStripped =')}
const __vue_template__ = typeof __vue_render__ !== 'undefined'
  ? { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ }
  : {}
/* style */
const __vue_inject_styles__ = ${hasStyle} ? function (inject) {
  if (!inject) return
  ${styles.map(
    (style, index) => {
      const source = IDENTIFIER.test(style.source) ? style.source : e(style.source)
      const map = !compiler.template.isProduction 
        ? (typeof style.map === 'string' && IDENTIFIER.test(style.map) ? style.map : o(style.map)) 
        : undefined
      const tokens = typeof style.module === 'string' && IDENTIFIER.test(style.module) ? style.module : o(style.module)
      
      return `inject("${scopeId + '_' + index}", { source: ${source}, map: ${map}, media: ${e(style.media)} })` +
      '\n' +
      (style.moduleName
        ? `Object.defineProperty(this, "${style.moduleName}", { value: ${tokens} })` + '\n'
        : '')
    }
  )}
} : undefined
/* scoped */
const __vue_scope_id__ = ${e(hasScopedStyle)} ? "${scopeId}" : undefined
/* module identifier */
const __vue_module_identifier__ = ${e(
    compiler.template.optimizeSSR
  )} ? "${scopeId}" : undefined
/* functional template */
const __vue_is_functional_template__ = ${e(template.functional)}
/* component normalizer */
${normalizeComponent}
/* style inject */
${!compiler.template.optimizeSSR ? createInjector : ''}
/* style inject SSR */
${compiler.template.optimizeSSR ? createInjectorSSR : ''}

export default __vue_normalize__(
  __vue_template__,
  __vue_inject_styles__,
  typeof __vue_script__ === 'undefined' ? {} : __vue_script__,
  __vue_scope_id__,
  __vue_is_functional_template__,
  __vue_module_identifier__,
  typeof __vue_create_injector__ !== 'undefined' ? __vue_create_injector__ : function () {},
  typeof __vue_create_injector_ssr__ !== 'undefined' ? __vue_create_injector_ssr__ : function () {}
)`

  return { code }
}
