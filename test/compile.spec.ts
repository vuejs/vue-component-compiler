import {createDefaultCompiler} from "../src"

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
