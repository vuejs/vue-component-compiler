# vue-component-compiler

[![npm version](https://badge.fury.io/js/vue-component-compiler.svg)](http://badge.fury.io/js/vue-component-compiler) [![Build Status](https://circleci.com/gh/vuejs/vue-component-compiler.svg?style=shield)](https://circleci.com/gh/vuejs/vue-component-compiler)

This module compile a single file Vue component like the one below into a CommonJS module that can be used in Browserify/Webpack/Component/Duo builds.

Currently supported preprocessors are:

- stylus
- less
- scss (via `node-sass`)
- jade
- coffee-script
- myth
- es6 (via `6to5` aka `babel`)

Also see [Registering Custom Pre-Processors](#user-content-registering-custom-pre-processors).

## Example

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

And you can import using the `src` attribute:

``` html
<style lang="stylus" src="style.styl"></style>
<template src="template.html"></template>
<script src="./scripts/main.js"></script>
```

## API

``` js
var compiler = require('vue-component-compiler')
// filePath should be an absolute path, and is optional if
// the fileContent doesn't contain src imports
compiler.compile(fileContent, filePath, function (err, result) {
  // result is a common js module string
})
```

## Registering Custom Pre-Processors

Create a `vue.config.js` file at where your build command is run (usually the root level of your project):

``` js
module.exports = function (compiler) {
  
  // register a compile function for <script lang="es">
  compiler.register({
    lang: 'es',
    type: 'script',
    compile: function (content, cb) {
      // transform the content...
      cb(null, content)
    }
  })

}
```
