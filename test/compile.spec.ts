import {createDefaultCompiler, DescriptorCompileResult} from "../src"

it('should prepend data scss option to actual style', () => {
  const compiler = createDefaultCompiler({
    style: {
      preprocessOptions : {
        scss: {
          data: `$testColor: red;`
        }
      }
    }
  })
  const result = compiler.compileStyle('foo.vue', 'foo',
    {type: 'style', lang: 'scss', content: '.foo_0{ color: $testColor }', map: undefined, attrs: {}, start: 1, end: 1}
  );

  expect(result.code).toEqual(expect.stringContaining('color: red'))
})

const source = `
<template>
  <h1 id="test" class="title">Hello {{ name }}!</h1>
</template>

<script>
export default {
  data () {
    return { name: 'John Doe' }
  }
}
</script>

<style>
.title {
  color: red;
}
</style>
`

it('should compile to descriptor', () => {
  const compiler = createDefaultCompiler()
  const result = compiler.compileToDescriptor('foo.vue', source)

  expect(removeRawResult(result)).toMatchSnapshot()
})

it('should compile to descriptor (async)', async () => {
  const compiler = createDefaultCompiler()
  const expected = compiler.compileToDescriptor('foo.vue', source)
  const result = await compiler.compileToDescriptorAsync('foo.vue', source)

  expect(removeRawResult(result)).toMatchSnapshot()
  expect(removeRawResult(result)).toEqual(removeRawResult(expected))
})

function removeRawResult(result: DescriptorCompileResult): DescriptorCompileResult {
  result.styles.map(style => {
    delete style.rawResult
  })

  return result
}
