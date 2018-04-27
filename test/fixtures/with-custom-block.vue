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

<documentation lang="md">
# Component

## Data

- **name** - Name of a person.
</documentation>
