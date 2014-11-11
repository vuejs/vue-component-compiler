var less = require('less')

module.exports = function (raw, cb) {
  less.render(raw, function (err, res) {
    // Less 2.0 returns an object instead rendered string
    if (typeof res === 'object') {
      res = res.css
    }
    cb(err, res)
  })
}