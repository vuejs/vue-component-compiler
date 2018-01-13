const { SourceMapConsumer } = require('source-map')
const parser = require('../src/parser')

test('generated map should match to correct position in original source', () => {
  const descriptor = parser(
    `<template>
      <div>Foo</div>
    </template>

    <script>
    export default {}
    </script>
    `, 'foo.vue')
  const consumer = new SourceMapConsumer(descriptor.script.map)
  const position = consumer.originalPositionFor({ line: 6, column: 0 })

  expect(position.line).toEqual(6)
  expect(position.source.startsWith('foo.vue')).toBeTruthy()
})

test('should not generate source map', () => {
  const descriptor = parser(`<script>export default {}</script>`, 'foo.vue', { needMap: false })

  expect(descriptor.script.map).toBeUndefined()
})
