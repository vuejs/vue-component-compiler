import * as postcss from 'postcss'
import CleanCSS from 'clean-css'

export default postcss.plugin('clean', (options: any) => {
  const clean = new CleanCSS({ compatibility: 'ie9', ...options })

  return (css: any, res: any) => {
    const output = clean.minify(css.toString())

    res.root = postcss.parse(output.styles)
  }
})
