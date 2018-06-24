import { rollup } from 'rollup'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import image from 'rollup-plugin-image'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export { compile, build, open, pack }

function vue() {
  return {
    name: 'vue',
    transform(code, id) {
      if (id.endsWith('.vue')) return compile(id, code)
    }
  }
}

function inline(filename, code) {
  return {
    name: 'Inline',
    resolveId(id) {
      if (id === filename) return filename
    },
    load(id) {
      if (id === filename) {
        return code
      }
    }
  }
}

function load(ext, handle) {
  return {
    name: 'load' + ext,
    load(id) {
      if (id.endsWith(ext)) return handle(id.split(':').pop())
    }
  }
}
import { createCompiler, assemble } from '../..'
const compiler = createCompiler({
  script: {},
  style: { trim: true },
  template: {
    compiler: require('vue-template-compiler'),
    compilerOptions: {},
    isProduction: process.env.NODE_ENV === 'production',
    optimizeSSR: process.env.VUE_ENV === 'server'
  }
})
function compile(filename, source) {
  const result = compiler.compileToDescriptor(filename, source)

  result.styles.forEach(style => {
    if (style.errors.length) console.error(style.errors)
  })

  return assemble(compiler, filename, result)
}

const babelit = babel({
  presets: [[require.resolve('babel-preset-env'), { modules: false }]],
  plugins: ['external-helpers'],
  babelrc: false,
  runtimeHelpers: true
})

async function pack(filename, source) {
  const name = filename + '__temp.js'
  let bundle = await rollup(<any>{
    input: name,
    plugins: [inline(name, compile(filename, source)), vue(), babelit]
  })
  bundle = await rollup({
    input: name,
    plugins: [
      load(
        '.png',
        id =>
          `export default "data:image/png;base64,${readFileSync(
            id,
            'base64'
          )}"\n`
      ),
      inline(name, (await bundle.generate({ format: 'cjs' })).code),
      commonjs(),
      babelit
    ]
  })

  return (await bundle.generate({ format: 'cjs' })).code
}

const cache = {}
async function build(filename) {
  if (filename in cache) return cache[filename]
  const source = compile(filename, readFileSync(filename).toString())
  const component = filename + '__.js'
  const input = filename + '__app.js'

  let bundle = await rollup(<any>{
    input,
    plugins: [
      vue(),
      image(),
      nodeResolve(),
      inline(component, source),
      inline(
        input,
        `
        import Component from '${component}'

        Vue.config.productionTip = false
        Vue.config.devtools = false

        new Vue({
          el: '#app',
          render (h) {
            return h(Component)
          }
        })
      `
      ),
      babelit
    ]
  })
  const generated = await bundle.generate({ format: 'cjs' })

  bundle = await rollup(<any>{
    input: component,
    plugins: [
      vue(),
      image(),
      commonjs(),
      inline(component, generated.code),
      babelit
    ]
  })

  cache[filename] = (await bundle.generate({
    format: 'iife',
    name: 'App'
  })).code

  return cache[filename]
}

const vueSource = readFileSync(
  resolve(__dirname, '../../node_modules/vue/dist/vue.min.js')
).toString()
const escape = (any: string) => any.replace(/<\//g, '&lt;\/')
async function open(name, browser, code, id = '#test') {
  const page = await browser.newPage()

  const content = `
  <!doctype html>
  <html>
    <head>
      <title>${name}</title>
    </head>
    <body>
      <div id="app"></div>
      <script>
      ${escape(vueSource)}
      </script>
      <script>
      ${escape(await code)}
      </script>
    </body>
  </html>`

  // Un-comment following lines to debug generated HTML.
  if (!Boolean(process.env.CI)) {
    const fs = require('fs')
    const path = require('path')
    const dir = path.join(__dirname, '../output')

    if (!fs.existsSync(dir)) fs.mkdirSync(dir)
    fs.writeFileSync(path.join(dir, name + '.html'), content)
  }

  await page.setContent(content)

  await page.waitFor(id)

  return page
}
