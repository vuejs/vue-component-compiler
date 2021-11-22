<template lang="pug">
  h1#test.title Hello {{ name }}!
</template>

<script lang="ts">
export default {
  data () {
    return { name: 'John Doe' }
  }
}
</script>

<style lang="scss">
$color: red;

.title {
  color: $color;
}
</style>
