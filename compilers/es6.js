var babel = require('babel')

module.exports = function (raw, cb) {
  try {
    var res = babel.transform(raw)
  } catch (err) {
    return cb(err)
  }
  cb(null, res.code)
}
