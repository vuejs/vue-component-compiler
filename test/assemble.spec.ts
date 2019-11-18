import {assembleFromSource, createDefaultCompiler} from "../src"

const compiler = createDefaultCompiler()
it('should inline style source', () => {
  const result = assembleFromSource(compiler, {}, {
    filename: 'foo.vue', script: {source: ''}, template: {source: ''}, scopeId: 'foo',
    styles: [{source: '.foo_0{ color: red }', module: { foo: 'foo_0' }, moduleName: '$style', map: {} }],
    customBlocks: []
  })

  expect(result.code).toEqual(expect.stringContaining('source: ".foo_0{ color: red }"'))
  expect(result.code).toEqual(expect.stringContaining('map: {}'))
  expect(result.code).toEqual(expect.stringContaining('value: {"foo":"foo_0"}'))
})

it('should use global in style source', () => {
  const result = assembleFromSource(compiler, {}, {
    filename: 'foo.vue', script: {source: ''}, template: {source: ''}, scopeId: 'foo',
    styles: [{source: 'fooStyle', module: 'fooModule', moduleName: '$style', map: 'fooMap'}],
    customBlocks: []
  })

  expect(result.code).toEqual(expect.stringContaining('source: fooStyle'))
  expect(result.code).toEqual(expect.stringContaining('map: fooMap'))
  expect(result.code).toEqual(expect.stringContaining('value: fooModule'))
})

it('should included source of custom blocks', () => {
  const result = assembleFromSource(compiler, {}, {
    filename: 'foo.vue', script: {source: ''}, template: {source: ''}, scopeId: 'foo',
    styles: [],
    customBlocks: [{
      source: [
        `export * from 'foo.vue?rollup-plugin-vue=customBlocks.0.i18n'`,
        `  import block0 from 'foo.vue?rollup-plugin-vue=customBlocks.0.i18n'`,
        `  if (typeof block0 === 'function') block0(Component)`
      ].join('\n'),
      type: 'i18n'
    }, {
      source: [
        `  export * from 'foo.vue?rollup-plugin-vue=customBlocks.1.json'`,
        `  import block1 from 'foo.vue?rollup-plugin-vue=customBlocks.1.json'`,
        `  if (typeof block1 === 'function') block1(Component)`
      ].join('\n'),
      type: 'i18n',
      lang: 'json'
    }]
  })
  expect(result.code).toMatchSnapshot()
})