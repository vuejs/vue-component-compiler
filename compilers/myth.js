var myth = require('myth')

module.exports = function (raw, cb) {
  try {
    var css = myth(raw)
  } catch (err) {
    return cb(err)
  }
  cb(null, css)
}
