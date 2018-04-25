import Basic from './fixtures/with-style.vue'

test('should compile template', () => {
  expect('render' in Basic).toBe(true)
  expect('staticRenderFns' in Basic).toBe(true)
})
