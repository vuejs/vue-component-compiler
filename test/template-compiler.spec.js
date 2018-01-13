const compiler = require('../src/template-compiler')

test('should compile template to esModule', () => {
  const template = {
    code: '<div>{{foo}}</div>\n',
    descriptor: {}
  }
  const compiled = compiler(template, 'foo.vue', { scopeId: 'xxx', isProduction: false })

  expect(compiled.code.indexOf('export default')).toBeGreaterThan(-1)
  expect(compiled.code.indexOf('render._withStripped')).toBeGreaterThan(-1)
})

test('should compile template to node module', () => {
  const template = {
    code: '<div>{{foo}}</div>\n',
    descriptor: {}
  }
  const compiled = compiler(template, 'foo.vue', { scopeId: 'xxx', esModule: false, isProduction: false })

  expect(compiled.code.indexOf('export default')).toBe(-1)
  expect(compiled.code.indexOf('render._withStripped')).toBeGreaterThan(-1)
})
