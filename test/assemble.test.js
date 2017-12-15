const assemble = require('../src/assemble')

const descriptors = {
  script: {
    type: 'script',
    content: '\nexport default {}\n',
    start: 10,
    end: 12,
    attrs: []
  },

  styles: [
    {
      type: 'style',
      content: '\n.foo { color: red }\n',
      start: 14,
      end: 16,
      attrs: [{ name: 'scoped' }],
      scoped: true
    },
    {
      type: 'style',
      content: `\n\$red: 'red';\n.bar { color: \$red }\n`,
      start: 18,
      end: 20,
      attrs: [{ name: 'lang', value: 'scss' }],
      lang: 'scss',
      module: 'one'
    }
  ],

  template: {
    type: 'style',
    content: '\n<div class="foo bar"></div>\n',
    start: 1,
    end: 3,
    attrs: []
  },

  customBlocks: [
    {
      type: 'markdown',
      content: '\n## Readme\nThis is markdown.\n',
      start: 5,
      end: 8,
      attrs: []
    }
  ]
}

const source = {
  script: { id: 'foo.vue?type=script', descriptor: descriptors.script },
  styles: [
    { id: 'foo.vue?type=style&index=0', descriptor: descriptors.styles[0] },
    { id: 'foo.vue?type=style&index=1', descriptor: descriptors.styles[1] }
  ],
  render: { id: 'foo.vue?type=template', descriptor: descriptors.template },
  customBlocks: [
    { id: 'foo.vue?type=custom&index=0', descriptor: descriptors.customBlocks[0] }
  ]
}

test('assemble code for SSR and HMR', () => {
  const result = assemble(source, 'foo.vue', { scopeId: 'data-v-xxx', isServer: true, hasStyleInjectFn: true, isHot: true, isProduction: false })

  console.log(result)
})

test('assemble code for non-SSR production', () => {
  const result = assemble(source, 'foo.vue', { scopeId: 'data-v-xxx' })

  console.log(result)
})

test('assemble code for SSR production', () => {
  const result = assemble(source, 'foo.vue', { scopeId: 'data-v-xxx', isServer: true, hasStyleInjectFn: true })

  console.log(result)
})

test('assemble code for non-SSR production as node module', () => {
  const result = assemble(source, 'foo.vue', { scopeId: 'data-v-xxx', esModule: false })

  console.log(result)
})

test('assemble code for non-SSR production with injections enabled', () => {
  const result = assemble(source, 'foo.vue', { scopeId: 'data-v-xxx', isInjectable: true })

  console.log(result)
})
