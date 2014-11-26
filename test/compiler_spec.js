var fs = require('fs')
var path = require('path')
var compiler = require('../index')

function read (file) {
  return fs.readFileSync(path.resolve(__dirname, file), 'utf-8')
}

function test (name) {
  it(name, function (done) {
    var file = read('fixtures/' + name + '.vue')
    var expected = read('expects/' + name + '.js')
    compiler.compile(file, function (err, result) {
      expect(!err).toBe(true)
      expect(result).toEqual(expected)
      done()
    })
  })
}

describe('Vue component compiler', function () {

  test('basic')
  test('empty')
  test('less')
  test('sass')
  test('multiple')
  test('src')

})