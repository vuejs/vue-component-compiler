const compiler = require('../src/style-compiler')

test('should rewrite scoped style', () => {
  const style = {
    code: '.foo { color: red }',
    descriptor: {
      scoped: true
    }
  }
  const compiled = compiler([style], 'foo.vue', { scopeId: 'xxx', needMap: false })
  expect(compiled[0].code.indexOf('.foo[xxx]')).toBeGreaterThan(-1)
})
