<script>
export default {
  functional: true,
  render (h) {
    return h('div', { class: 'foo', attrs: { id: 'test' }}, ['Hello functional'])
  }
}
</script>

<style>
.foo { color: red; }
</style>
