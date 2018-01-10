<template>
  <h1 :class="$style.my.title">Hello {{ name }}!</h1>
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
