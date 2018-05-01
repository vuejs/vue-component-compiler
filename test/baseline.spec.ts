const puppeteer = require('puppeteer')
const { readdirSync } = require('fs')
const { join, resolve } = require('path')
import { build, open } from './setup/utils'

let browser = null
const fixtures = readdirSync(join(__dirname, 'fixtures'))
  .filter(it => it.endsWith('.vue'))
  .map(it => it.replace(/\.vue$/i, ''))

beforeAll(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: Boolean(process.env.CI)
  })
})
afterAll(async () => browser && (await browser.close()))

fixtures.forEach(it =>
  test(it, async () => {
    const filename = join(__dirname, 'fixtures', it + '.vue')
    const code = await build(filename)
    const page = await open(it, browser, code)
    expect(await page.$('#test')).toBeTruthy()
    expect(
      await page.evaluate(() => document.getElementById('test').textContent)
    ).toEqual(expect.stringContaining('Hello'))
    expect(
      await page.evaluate(
        () => window.getComputedStyle(document.getElementById('test')).color
      )
    ).toEqual('rgb(255, 0, 0)')

    await page.close()
    resolve()
  })
)
