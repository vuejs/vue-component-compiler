const { readdirSync, readFileSync } = require('fs')
const { join } = require('path')
const compiler = require('..')

const fixtures = readdirSync(join(__dirname, 'fixtures'))
  .filter(it => it.endsWith('.vue'))
  .map(it => it.replace(/\.vue$/i, ''))

fixtures.forEach(it => test(it, async () => {
  const filename = join(__dirname, 'fixtures', it + '.vue')
  const descriptor = compiler.parse(readFileSync(filename).toString(), filename, { needMap: true })
  const scopeId = compiler.generateScopeId(it + '.vue', join(__dirname, 'fixtures'))
  const render = descriptor.template ? compiler.compileTemplate(
    { code: descriptor.template.content, descriptor: descriptor.template }, filename
  ) : null
  const styles = (await Promise.all(descriptor.styles.map(async it => await compiler.compileStyle(
    { code: it.content, descriptor: it }, filename, { async: true, scopeId }
  )))).map((style, i) => Object.assign({ descriptor: descriptor.styles[i] }, style))
  const output = compiler.assemble({
    styles,
    render: {
      content: render && render.code
    },
    script: {
      content: descriptor.script && descriptor.script.content
    }
  }, filename)

  console.log(it, '\n' + output)
  // console.log(it, JSON.stringify({render, styles}, null, 2))
}))
