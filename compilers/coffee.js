var coffee = require('coffee-script')

module.exports = function (raw, cb) {
  try {
    var js = coffee.compile(raw, {
      bare: true
    })
  } catch (err) {
    return cb(err)
  }
  cb(null, js)
}