const crypto = require('crypto')
const babel = require('babel-core')
const fs = require('fs')
const path = require('path')
const { createDefaultCompiler, assemble } = require('../..')

const compiler = createDefaultCompiler()
function compile(filename, source) {
  return assemble(
    compiler,
    filename,
    compiler.compileToDescriptor(filename, source)
  ).code
}

const isSourceChanged =
  fs.readFileSync(path.resolve(__dirname, '../../dist/compiler.js')) +
  ':' +
  fs.readFileSync(path.resolve(__dirname, '../../dist/assembler.js')) +
  ':' +
  fs.readFileSync(path.resolve(__dirname, '../../dist/postcss-clean.js')) +
  ':' +
  fs.readFileSync(path.resolve(__dirname, '../../package.json'))

module.exports = {
  process(code, path) {
    if (path.endsWith('.vue')) {
      code = compile(path, code)
    } else if (path.endsWith('.png')) {
      code = `module.exports = "data:image/png;base64,${fs.readFileSync(
        path,
        'base64'
      )}"`
    }
    return babel.transform(code, {
      presets: [['env', { targets: { node: 'current' } }]]
    }).code
  },
  getCacheKey(fileData, filename, configString) {
    return crypto
      .createHash('md5')
      .update(
        fileData +
          filename +
          configString +
          (filename.endsWith('.vue')
            ? process.env.NODE_ENV + process.env.VUE_ENV + isSourceChanged
            : ''),
        'utf8'
      )
      .digest('hex')
  }
}
