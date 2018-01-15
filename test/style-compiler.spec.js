const compiler = require('../src/style-compiler')

const style = {
  code: `
.test {
  color: yellow;
}
.test:after {
  content: 'bye!';
}
h1 {
  color: green;
}
.anim {
  animation: color 5s infinite, other 5s;
}
.anim-2 {
  animation-name: color;
  animation-duration: 5s;
}
.anim-3 {
  animation: 5s color infinite, 5s other;
}
.anim-multiple {
  animation: color 5s infinite, opacity 2s;
}
.anim-multiple-2 {
  animation-name: color, opacity;
  animation-duration: 5s, 2s;
}

@keyframes color {
  from { color: red; }
  to { color: green; }
}
@-webkit-keyframes color {
  from { color: red; }
  to { color: green; }
}
@keyframes opacity {
  from { opacity: 0; }
  to { opacity: 1; }
}
@-webkit-keyframes opacity {
  from { opacity: 0; }
  to { opacity: 1; }
}
.foo p >>> .bar {
  color: red;
}
@media print {
  .foo {
    color: #000;
  }
}
@supports ( color: #000 ) {
  .foo {
    color: #000;
  }
}
  `.trim(),
  descriptor: {
    scoped: true
  }
}

const compiled = compiler(style, 'foo.vue', { scopeId: 'xxx' })

test('scoped', () => {
  expect(compiled.code).toEqual(expect.stringContaining('.test[xxx]'))
  expect(compiled.code).toEqual(expect.stringContaining(`.test[xxx] {\n  color: yellow;\n}`))
  expect(compiled.code).toEqual(expect.stringContaining(`.test[xxx]:after {\n  content: \'bye!\';\n}`))
  expect(compiled.code).toEqual(expect.stringContaining(`h1[xxx] {\n  color: green;\n}`))
  // scoped keyframes
  expect(compiled.code).toEqual(expect.stringContaining(`.anim[xxx] {\n  animation: color-xxx 5s infinite, other 5s;`))
  expect(compiled.code).toEqual(expect.stringContaining(`.anim-2[xxx] {\n  animation-name: color-xxx`))
  expect(compiled.code).toEqual(expect.stringContaining(`.anim-3[xxx] {\n  animation: 5s color-xxx infinite, 5s other;`))
  expect(compiled.code).toEqual(expect.stringContaining(`@keyframes color-xxx {`))
  expect(compiled.code).toEqual(expect.stringContaining(`@-webkit-keyframes color-xxx {`))

  expect(compiled.code).toEqual(expect.stringContaining(`.anim-multiple[xxx] {\n  animation: color-xxx 5s infinite,opacity-xxx 2s;`))
  expect(compiled.code).toEqual(expect.stringContaining(`.anim-multiple-2[xxx] {\n  animation-name: color-xxx,opacity-xxx;`))
  expect(compiled.code).toEqual(expect.stringContaining(`@keyframes opacity-xxx {`))
  expect(compiled.code).toEqual(expect.stringContaining(`@-webkit-keyframes opacity-xxx {`))
  // >>> combinator
  expect(compiled.code).toEqual(expect.stringContaining(`.foo p[xxx] .bar {\n  color: red;\n}`))
})

test('media query', () => {
  expect(compiled.code).toEqual(expect.stringContaining(`@media print {\n.foo[xxx] {\n    color: #000;\n}\n}`))
})

test('supports query', () => {
  expect(compiled.code).toEqual(expect.stringContaining(`@supports ( color: #000 ) {\n.foo[xxx] {\n    color: #000;\n}\n}`))
})

test('sourcemap', () => {
  expect(
    compiler(style, 'foo.vue', { scopeId: 'xxx' }).map
  ).toBeTruthy()

  expect(
    compiler(style, 'foo.vue', { scopeId: 'xxx', needMap: false }).map
  ).toEqual(undefined)
})

test('css modules', () => {
  const style = {
    code: `
.red {
  color: red;
}
@keyframes fade {
  from { opacity: 1; } to { opacity: 0; }
}
.animate {
  animation: fade 1s;
}
    `,
    descriptor: { module: true }
  }
  const compiled = compiler(style, 'foo.vue', { scopeId: 'xxx' })

  expect(compiled.modules).toHaveProperty('red', expect.stringMatching(/^red-[0-9a-z]{10}$/i))
  expect(compiled.modules).toHaveProperty('animate', expect.stringMatching(/^animate-[0-9a-z]{10}$/i))
  expect(compiled.modules).toHaveProperty('fade', expect.stringMatching(/^fade-[0-9a-z]{10}$/i))

  expect(compiled.code).toEqual(expect.stringContaining(`animation: ${compiled.modules.fade} 1s;`))
})

test('postcss options', () => {
  const style = {
    code: `
h1
  color: red
  font-size: 14px
    `,
    descriptor: {}
  }
  const compiled = compiler(style, 'foo.vue', { scopeId: 'xxx', options: { parser: require('sugarss') }})

  expect(compiled.code).toEqual(expect.stringContaining(`h1 {\n  color: red;\n  font-size: 14px\n}`))
})
