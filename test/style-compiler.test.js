const compiler = require('../src/style-compiler')

test('should rewrite scoped style', async () => {
  const style = {
    code: '.foo { color: red }',
    descriptor: {
      scoped: true
    }
  }
  const compiled = await compiler([style], 'foo.vue', { scopeId: 'xxx', needMap: false })
  expect(compiled[0].code.indexOf('.foo[xxx]')).toBeGreaterThan(-1)
})
