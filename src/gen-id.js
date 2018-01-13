// utility for generating a uid for each component file
// used in scoped CSS rewriting
const path = require('path')
const hash = require('hash-sum')

module.exports = function genId (filename, content, isProduction = true) {
  return 'data-v' + (isProduction ? hash(path.basename(filename) + '\n' + content) : hash(filename))
}
