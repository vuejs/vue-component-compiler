var sass = require('node-sass')

module.exports = function (raw, cb) {
  sass.render({
    data: raw,
    options: {
      sourceComments: 'normal'
    },
    success: function (css) {
      cb(null, css)
    },
    error: function (err) {
      cb(err)
    }
  })
}