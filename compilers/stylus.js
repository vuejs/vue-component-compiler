var stylus = require('stylus')

module.exports = function (raw, cb) {
  stylus.render(raw, {}, cb)
}