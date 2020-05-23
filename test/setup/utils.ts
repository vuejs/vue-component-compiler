import { rollup } from 'rollup'
import babel from '@rollup/plugin-babel'
import nodeResolve from '@rollup/plugin-node-resolve'
const commonjs = require('@rollup/plugin-commonjs');
const image = require('@rollup/plugin-image');
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Browser } from "puppeteer";
import { createCompiler, assemble } from '../..'
import { AssembleResults } from "../../src";

export { compile, build, open, pack }

function vue() {
  return {
    name: 'vue',
    transform(code: string, id: string) {
      if (id.endsWith('.vue')) return compile(id, code)
    }
  }
}

function inline(filename: string, code: string | AssembleResults) {
  return {
    name: 'Inline',
    resolveId(id: string) {
      if (id === filename) return filename
    },
    load(id: string) {
      if (id === filename) {
        return code
      }
    }
  }
}

function load(ext: string, handle: (T: string) => string) {
  return {
    name: 'load' + ext,
    load(id: string) {
      if (id.endsWith(ext)) return handle(id.split(':').pop()!)
    }
  }
}

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
function compile(filename: string, source: string) {
  const result = compiler.compileToDescriptor(filename, source)

  result.styles.forEach(style => {
    if (style.errors.length) console.error(style.errors)
  })

  return assemble(compiler, filename, result)
}

const babelit = babel({
  presets: [[require.resolve('@babel/preset-env'), { modules: false }]],
  plugins: ["@babel/plugin-transform-runtime"],
  babelrc: false,
  babelHelpers: 'runtime',
})

async function pack(filename: string, source: string) {
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
        (id) =>
          `export default "data:image/png;base64,${readFileSync(
            id,
            'base64'
          )}"\n`
      ),
      inline(name, (await bundle.generate({ format: 'cjs' })).output[0].code),
      commonjs(),
      babelit
    ]
  })

  return (await bundle.generate({ format: 'cjs' })).output[0].code
}

const cache: Record<string, string> = {}
async function build(filename: string) {
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
      inline(component, generated.output[0].code),
      babelit
    ]
  })

  cache[filename] = (await bundle.generate({
    format: 'iife',
    name: 'App'
  })).output[0].code

  return cache[filename]
}

const vueSource = readFileSync(
  resolve(__dirname, '../../node_modules/vue/dist/vue.min.js')
).toString()
const escape = (any: string) => any.replace(/<\//g, '&lt;\/')
async function open(name: string, browser: Browser, code: string, id = '#test') {
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
