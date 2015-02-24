var fs = require('fs')
var path = require('path')
var compiler = require('../index')
var assert = require('assert')

function read (file) {
  return fs.readFileSync(path.resolve(__dirname, file), 'utf-8')
}

function test (name) {
  it(name, function (done) {
    var filePath = 'fixtures/' + name + '.vue'
    var fileContent = read(filePath)
    var expected = read('expects/' + name + '.js')
    compiler.compile(
      fileContent,
      path.resolve(__dirname, filePath),
      function (err, result) {
        assert(!err)
        assert.equal(result, expected)
        done()
      }
    )
  })
}

describe('Vue component compiler', function () {
  fs.readdirSync(path.resolve(__dirname, 'expects'))
    .forEach(function (file) {
      test(path.basename(file, '.js'))
    })
})
