const compiler = require('../src/style-compiler')

test('should rewrite scoped style', async () => {
  const style = {
    code: '.foo { color: red }',
    descriptor: {
      scoped: true
    }
  }
  const compiled = await compiler([style], 'foo.vue', { scopeId: 'xxx' })
  expect(compiled[0].css.indexOf('.foo[xxx]')).toBeGreaterThan(-1)
})
