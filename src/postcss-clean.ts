import * as postcss from 'postcss'
// ESM import of clean-css breaks test/runtime check this fix for reference:
// https://github.com/vuejs/vue-component-compiler/pull/103#issuecomment-632676899
const CleanCSS = require('clean-css')

export default postcss.plugin('clean', (options: any) => {
  const clean = new CleanCSS({ compatibility: 'ie9', ...options })

  return (css: any, res: any) => {
    const output = clean.minify(css.toString())

    res.root = postcss.parse(output.styles)
  }
})
