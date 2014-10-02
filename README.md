# vue-component-compiler

This module compile a single file Vue component like the one below into a CommonJS module that can be used in Browserify/Webpack/Component/Duo builds.

``` html
// app.vue
<style>
  .red {
    color: #f00;
  }
</style>

<template>
  <h1 class="red">{{msg}}</h1>
</template>

<script>
  module.exports = {
    data: function () {
      return {
        msg: 'Hello world!'
      }
    }
  }
</script>
```

You can also mix preprocessor languages in the component file:

``` html
// app.vue
<style lang="stylus">
.red
  color #f00
</style>

<template lang="jade">
h1(class="red") {{msg}}
</template>

<script lang="coffee">
module.exports =
  data: ->
    msg: 'Hello world!'
</script>
```

## Usage

``` js
var compiler = require('vue-component-compiler')
compiler.compile(fileContent, function (err, result) {
  // result is a common js module string
})
```