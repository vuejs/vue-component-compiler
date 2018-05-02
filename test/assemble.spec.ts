import {assembleFromSource, createDefaultCompiler} from "../src"

const compiler = createDefaultCompiler()
it('should inline style source', () => {
  const result = assembleFromSource(compiler, {}, {
    filename: 'foo.vue', script: {source: ''}, template: {source: ''}, scopeId: 'foo',
    styles: [{source: '.foo_0{ color: red }', module: { foo: 'foo_0' }, moduleName: '$style', map: {} }]
  })

  expect(result.code).toEqual(expect.stringContaining('source: ".foo_0{ color: red }"'))
  expect(result.code).toEqual(expect.stringContaining('map: {}'))
  expect(result.code).toEqual(expect.stringContaining('value: {"foo":"foo_0"}'))
})

it('should use global in style source', () => {
  const result = assembleFromSource(compiler, {}, {
    filename: 'foo.vue', script: {source: ''}, template: {source: ''}, scopeId: 'foo',
    styles: [{source: 'fooStyle', module: 'fooModule', moduleName: '$style', map: 'fooMap'}]
  })

  expect(result.code).toEqual(expect.stringContaining('source: fooStyle'))
  expect(result.code).toEqual(expect.stringContaining('map: fooMap'))
  expect(result.code).toEqual(expect.stringContaining('value: fooModule'))
})
