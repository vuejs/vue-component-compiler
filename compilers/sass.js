var sass = require('node-sass')

module.exports = function (raw, cb) {
  sass.render({
    data: raw,
    options: {
      sourceComments: 'normal'
    },
    success: function (res) {
      if (typeof res === 'object') {
        cb(null, res.css)
      } else {
        cb(null, css) // compat for node-sass < 2.0.0
      }
    },
    error: function (err) {
      cb(err)
    }
  })
}