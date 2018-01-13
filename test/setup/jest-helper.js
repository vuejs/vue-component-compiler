const { compile } = require('./utils')
const crypto = require('crypto')
const babel = require('babel-core')
const fs = require('fs')

module.exports = {
  process (src, path) {
    let code = src
    if (path.endsWith('.vue')) code = compile(path, src)
    else if (path.endsWith('.png')) code = `export default "data:image/png;base64,${fs.readFileSync(path, 'base64')}"`

    return babel.transform(code, { presets: [
      ['env', { targets: { node: 'current' }}]
    ] }).code
  },
  getCacheKey (fileData, filename, configString) {
    return crypto.createHash('md5')
      .update(fileData + filename + configString, 'utf8')
      .digest('hex')
  }
}
