const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const image = require('rollup-plugin-image')
const { readFileSync } = require('fs')
const { join, resolve } = require('path')
const compiler = require('../..')

module.exports = { compile, build, open, pack }

function inline (filename, code) {
  return {
    name: 'Inline',
    resolveId (id) {
      if (id === filename) return filename
    },
    load (id) {
      if (id === filename) return code
    }
  }
}

function load (ext, handle) {
  return {
    name: 'load' + ext,
    load (id) {
      if (id.endsWith(ext)) return handle(id.split(':').pop())
    }
  }
}

function compile (filename, source) {
  source = source || readFileSync(filename).toString()
  const descriptor = compiler.parse(source, filename, { needMap: true })
  const scopeId = compiler.generateScopeId(filename, join(__dirname, 'fixtures'))
  const render = descriptor.template ? compiler.compileTemplate(
    { code: descriptor.template.content, descriptor: descriptor.template }, filename, { scopeId }
  ) : null
  const styles = descriptor.styles.map(it => compiler.compileStyle(
    { code: it.content, descriptor: it }, filename, { scopeId }
  )).map((style, i) => ({ descriptor: descriptor.styles[i], code: style.code, map: style.map, modules: style.modules }))
  return compiler.assemble({
    styles,
    render: {
      code: render && render.code,
      descriptor: descriptor.template
    },
    script: {
      code: descriptor.script && descriptor.script.content,
      descriptor: descriptor.script
    },
    customBlocks: []
  }, filename, {
    scopeId,
    require: {
      normalizeComponent: resolve(__dirname, '../../src/runtime/normalize-component.js'),
      injectStyleClient: resolve(__dirname, '../../src/runtime/inject-style-client.js'),
      injectStyleServer: resolve(__dirname, '../../src/runtime/inject-style-server.js')
    }
  })
}

const babelit = babel({
  presets: [
    [require.resolve('babel-preset-env'), { modules: false }]
  ],
  plugins: ['external-helpers'],
  babelrc: false,
  runtimeHelpers: true
})

async function pack (filename, source) {
  const name = filename + '__temp.js'
  let bundle = await rollup.rollup({
    input: name,
    plugins: [
      inline(name, compile(filename, source)), babelit
    ]
  })
  bundle = await rollup.rollup({
    input: name,
    plugins: [
      load('.png', id => `export default "data:image/png;base64,${readFileSync(id, 'base64')}"\n`),
      inline(name, (await bundle.generate({ format: 'cjs' })).code), commonjs(), babelit
    ]
  })

  return (await bundle.generate({ format: 'cjs' })).code
}

const cache = {}
async function build (filename) {
  if (filename in cache) return cache[filename]

  const source = compile(filename)
  const component = filename + '__.js'
  const input = filename + '__app.js'

  let bundle = await rollup.rollup({
    input,
    plugins: [
      image(),
      nodeResolve(),
      inline(component, source),
      inline(input, `
        import Component from '${component}'

        Vue.config.productionTip = false
        Vue.config.devtools = false

        new Vue({
          el: '#app',
          render (h) {
            return h(Component)
          }
        })
      `),
      babelit
    ]
  })
  const generated = await bundle.generate({ format: 'cjs' })

  bundle = await rollup.rollup({
    input: component,
    plugins: [
      image(), commonjs(), inline(component, generated.code), babelit
    ]
  })

  cache[filename] = (
    await bundle.generate({ format: 'iife', name: 'App' })
  ).code

  return cache[filename]
}

const vueSource = readFileSync(resolve(__dirname, '../../node_modules/vue/dist/vue.min.js'))
async function open (browser, code, id = '#test') {
  const page = await browser.newPage()

  page.on('console', async any => console.log(any.text))

  await page.setContent(`
  <!doctype html>
  <html>
    <head>
      <title>Test: ${it}</title>
    </head>
    <body>
      <div id="app"></div>
      <script>${vueSource}</script>
      <script>${await code}</script>
    </body>
  </html>`)

  await page.waitFor(id)

  return page
}
