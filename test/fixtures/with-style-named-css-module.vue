<template>
  <h1 id="test" :class="my.title">Hello {{ name }}!</h1>
</template>

<script>
  export default {
    data () {
      return { name: 'John Doe' }
    }
  }
</script>

<style module="my">
.title {
  color: red;
}
</style>
