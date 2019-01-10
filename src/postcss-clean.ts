import * as postcss from 'postcss'
import CleanCSS = require('clean-css')

export default postcss.plugin('clean', options => {
  const clean = new CleanCSS({ compatibility: 'ie9', ...options })

  return (css: any, res: any) => {
    const output = clean.minify(css.toString())
    const from = css.source && css.source.input && css.source.input.file
    res.root = postcss.parse(output.styles, {from})
  }
})
