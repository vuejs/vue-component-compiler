var jade = require('jade')

module.exports = function (raw, cb) {
  try {
    var html = jade.compile(raw)({})
  } catch (err) {
    return cb(err)
  }
  cb(null, html)
}