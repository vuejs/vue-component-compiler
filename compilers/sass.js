module.exports = function (raw, cb) {
  try {
    var sass = require('node-sass')
  } catch (err) {
    return cb(err)
  }
  sass.render({
    data: raw,
    options: {
      sourceComments: 'normal'
    },
    success: function (res) {
      if (typeof res === 'object') {
        cb(null, res.css)
      } else {
        cb(null, res) // compat for node-sass < 2.0.0
      }
    },
    error: function (err) {
      cb(err)
    }
  })
}