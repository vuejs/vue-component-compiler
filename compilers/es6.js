var to5 = require('6to5')

module.exports = function (raw, cb) {
  try {
    var res = to5.transform(raw)
  } catch (err) {
    return cb(err)
  }
  cb(null, res.code)
}
