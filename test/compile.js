var fs = require('fs')
var path = require('path')
var compiler = require('../index')
var filename = 'fixtures/' + process.argv[2] + '.vue'
var file = fs.readFileSync(path.resolve(__dirname, filename), 'utf-8')

compiler.compile(file, function (err, result) {
  console.log(result)
})