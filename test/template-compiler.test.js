const compiler = require('../src/template-compiler')

test('should compile template to esModule', async () => {
  const template = {
    code: '<div>{{foo}}</div>\n'
  }
  const compiled = await compiler(template, 'foo.vue', { scopeId: 'xxx' })

  expect(compiled.code.indexOf('export default')).toBeGreaterThan(-1)
  expect(compiled.code.indexOf('render._withStripped')).toBeGreaterThan(-1)
  expect(compiled.code.indexOf('module.hot.accept')).toBe(-1)
})

test('should compile template to node module', async () => {
  const template = {
    code: '<div>{{foo}}</div>\n'
  }
  const compiled = await compiler(template, 'foo.vue', { scopeId: 'xxx', esModule: false })

  expect(compiled.code.indexOf('export default')).toBe(-1)
  expect(compiled.code.indexOf('render._withStripped')).toBeGreaterThan(-1)
  expect(compiled.code.indexOf('module.hot.accept')).toBe(-1)
})

test('should compile with HMR', async () => {
  const template = {
    code: '<div>{{foo}}</div>\n'
  }
  const compiled = await compiler(template, 'foo.vue', { scopeId: 'xxx', isHot: true })

  expect(compiled.code.indexOf('module.hot.accept')).toBeGreaterThan(-1)
})
