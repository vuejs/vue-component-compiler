const compiler = require('../src/template-compiler')

test('es module render functions', () => {
  const template = {
    code: '<div>{{foo}}</div>\n',
    descriptor: {}
  }
  const compiled = compiler(template, 'foo.vue', { scopeId: 'xxx', isProduction: false })

  expect(compiled.code.indexOf('export default')).toBeGreaterThan(-1)
  expect(compiled.code.indexOf('render._withStripped')).toBeGreaterThan(-1)
})

test('cjs render functions', () => {
  const template = {
    code: '<div>{{foo}}</div>\n',
    descriptor: {}
  }
  const compiled = compiler(template, 'foo.vue', { scopeId: 'xxx', esModule: false, isProduction: false })

  expect(compiled.code.indexOf('export default')).toBe(-1)
  expect(compiled.code.indexOf('render._withStripped')).toBeGreaterThan(-1)
})

test('template comments', () => {
  const template = {
    code: `<div>\n<h2 class="red" id="test">{{msg}}</h2><!-- comment here -->\n</div>\n`,
    descriptor: {}
  }
  const compiled = compiler(template, 'foo.vue', { scopeId: 'xxx' })

  expect(compiled.code).toEqual(expect.stringContaining('comment here'))
})
