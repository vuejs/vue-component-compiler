import {parse, Plugin} from 'postcss';

// ESM import of clean-css breaks test/runtime check this fix for reference:
// https://github.com/vuejs/vue-component-compiler/pull/103#issuecomment-632676899
const CleanCSS = require('clean-css')

export const postcss = true;

export default (options: import('clean-css').Options = {}): Plugin => {
  const clean = new CleanCSS(Object.assign({ compatibility: 'ie9' }, options))
  return {
    postcssPlugin: 'clean',
    Once(css, res) {
      const output = clean.minify(css.toString())
      res.root = () => parse(output.styles)
    },
  }
}
