const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const puppeteer = require('puppeteer')
const tmp = require('tempy')
const { readdirSync, readFileSync, writeFileSync } = require('fs')
const { join, resolve } = require('path')
const compiler = require('..')

const fixtures = readdirSync(join(__dirname, 'fixtures'))
  .filter(it => it.endsWith('.vue'))
  .map(it => it.replace(/\.vue$/i, ''))

let browser = null

fixtures.forEach(it => test(it, async () => {
  const filename = join(__dirname, 'fixtures', it + '.vue')
  const descriptor = compiler.parse(readFileSync(filename).toString(), filename, { needMap: true })
  const scopeId = compiler.generateScopeId(it + '.vue', join(__dirname, 'fixtures'))
  const render = descriptor.template ? compiler.compileTemplate(
    { code: descriptor.template.content, descriptor: descriptor.template }, filename
  ) : null
  const styles = (await Promise.all(descriptor.styles.map(async it => await compiler.compileStyle(
    { code: it.content, descriptor: it }, filename, { async: true, scopeId }
  )))).map((style, i) => ({ descriptor: descriptor.styles[i], content: style.code, map: style.map, modules: style.modules }))
  const source = compiler.assemble({
    styles,
    render: {
      content: render && render.code
    },
    script: {
      content: descriptor.script && descriptor.script.content
    }
  }, filename, {
    scopeId,
    require: {
      normalizeComponent: resolve(__dirname, '../src/runtime/normalize-component.js'),
      injectStyleClient: resolve(__dirname, '../src/runtime/inject-style-client.js'),
      injectStyleServer: resolve(__dirname, '../src/runtime/inject-style-server.js')
    }
  })
  const component = tmp.file({ extension: 'js' })
  const input = tmp.file({ extension: 'js' })

  writeFileSync(component, source)
  writeFileSync(input, `
  import Component from '${component}'

  new Vue({
    el: '#app',
    render (h) {
      return h(Component)
    }
  })
  `)

  const bundle = await rollup.rollup({
    input,
    external: ['vue'],
    plugins: [babel({
      presets: [
        [require.resolve('babel-preset-env'), { modules: false }]
      ],
      babelrc: false
    })]
  })

  const { code } = await bundle.generate({
    format: 'iife',
    name: 'App'
  })

  const page = await browser.newPage()
  page.on('console', any => any.type === 'error' && console.log(it + ' ==>\n' + any.text, component))
  await page.setContent(`
  <!doctype html>
  <html>
    <head>
      <title>Test: ${it}</title>
    </head>
    <body>
      <div id="app"></div>
      <script src="https://unpkg.com/vue"></script>
      <script>
        Vue.config.productionTip = false
        Vue.config.devtools = false
      </script>
      <script>${code}</script>
    </body>
  </html>`)
  await page.waitFor('#test')
  const el = await page.$('#test')
  expect(el).toBeTruthy()
  expect(await page.evaluate(() => document.getElementById('test').textContent)).toEqual(expect.stringContaining('Hello'))
  expect(await page.evaluate(() => window.getComputedStyle(document.getElementById('test')).color)).toEqual('rgb(255, 0, 0)')

  await page.close()
  resolve()
}))

beforeAll(async () => { browser = await puppeteer.launch() })
afterAll(async () => browser && await browser.close())
