var fs = require('fs')
var path = require('path')
var compiler = require('../index')

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
        expect(!err).toBe(true)
        expect(result).toEqual(expected)
        done()
      }
    )
  })
}

describe('Vue component compiler', function () {

  test('basic')
  test('empty')
  test('less')
  test('sass')
  test('myth')
  test('multiple')
  test('src')
  test('es6')

})
