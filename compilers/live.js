var ls = require('LiveScript');

module.exports = function(raw, cb) {
  try {
    var js = ls.compile(raw, {
      bare: true
    })
  } catch (err) {
    return cb(err)
  }
  cb(null, js)
}
