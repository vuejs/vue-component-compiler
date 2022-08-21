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


test('detect script lang attribute', () => {
  const source = `
    <template>
      <h1 id="test">Hello {{ name }}!</h1>
    </template>

    <script lang="ts">
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

  const compiler = createDefaultCompiler()
  const result = compiler.compileToDescriptor('foo.vue', source)

  expect(result.script.lang).toBe('ts')
})

describe('when source contains css module', () => {
  const componentSource = `
    <template>
      <h1 id="test" :class="$style.title">Hello {{ name }}!</h1>
    </template>

    <script>
    export default {
      data () {
        return { name: 'John Doe' }
      }
    }
    </script>

    <style module>
    .title {
      color: red;
    }
    </style>
    `


  describe('production mode', () => {
    const prodCompiler = createDefaultCompiler(({
      template: {
        isProduction: true
      }
    }) as any)

    it('should generate deterministic class names when the same component is compiled multiple times', () => {

      const result1 = prodCompiler.compileToDescriptor('foo.vue', componentSource)
      const result2 = prodCompiler.compileToDescriptor('foo.vue', componentSource)

      const styles1 = result1.styles[0].code;
      const styles2 = result2.styles[0].code;

      expect(styles1).toEqual(styles2)
    })
  })

  describe('develop mode', () => {
    const devCompiler = createDefaultCompiler(({
      template: {
        isProduction: false
      }
    }) as any)

    it('should generate deterministic class names when the same component is compiled multiple times', () => {

      const result1 = devCompiler.compileToDescriptor('foo.vue', componentSource)
      const result2 = devCompiler.compileToDescriptor('foo.vue', componentSource)

      const styles1 = result1.styles[0].code;
      const styles2 = result2.styles[0].code;

      expect(styles1).toEqual(styles2)
    })
  })
})
