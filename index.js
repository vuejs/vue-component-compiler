var fs = require('fs')
var path = require('path')
var htmlMinifier = require("html-minifier")
var cssMinifier = new require('clean-css')()
var parse5 = require('parse5')
var parser = new parse5.Parser()
var serializer = new parse5.TreeSerializer()
var async = require('async')

var scriptLangs = [
  'coffee',
  'es6'
]

var styleLangs = [
  'less',
  'sass',
  'stylus',
  'myth'
]

var templateLangs = [
  'jade'
]

exports.compile = function (content, filePath, cb) {
  // path is optional
  if (typeof filePath === 'function') {
    cb = filePath
    filePath = process.cwd()
  }

  // only 1 template tag is allowed, while styles and
  // scripts are concatenated.
  var template
  var script = ''
  var style = ''
  var output = ''
  var jobs = []

  var fragment = parser.parseFragment(content)
  fragment.childNodes.forEach(function (node) {
    switch (node.nodeName) {
      case 'template':
        template = checkSrc(node, filePath) || serializeTemplate(node)
        var lang = checkLang(node)
        if (templateLangs.indexOf(lang) < 0) {
          break
        }
        jobs.push(function (cb) {
          require('./compilers/' + lang)(template, function (err, res) {
            template = res
            cb(err)
          })
        })
        break
      case 'style':
        var rawStyle = checkSrc(node, filePath) || serializer.serialize(node)
        var lang = checkLang(node)
        if (lang === 'scss') {
          lang = 'sass'
        }
        if (styleLangs.indexOf(lang) < 0) {
          style += rawStyle
          break
        }
        jobs.push(function (cb) {
          require('./compilers/' + lang)(rawStyle, function (err, res) {
            style += res
            cb(err)
          })
        })
        break
      case 'script':
        var rawScript = checkSrc(node, filePath) || serializer.serialize(node).trim()
        var lang = checkLang(node)
        if (scriptLangs.indexOf(lang) < 0) {
          script += (script ? '\n' : '') + rawScript
          break
        }
        jobs.push(function (cb) {
          require('./compilers/' + lang)(rawScript, function (err, res) {
            script += (script ? '\n' : '') + res
            cb(err)
          })
        })
        break
    }
  })

  async.parallel(jobs, function (err) {
    if (err) return cb(err)
    // style
    if (style) {
      style = cssMinifier.minify(style)
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
      output += 'require("insert-css")("' + style + '");\n'
    }

    // template
    if (template) {
      template = htmlMinifier.minify(template)
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
      output += 'var __vue_template__ = "' + template + '";\n'
    }

    // js
    if (script) {
      output += script + '\n'
    }

    if (template) {
      output += 'module.exports.template = __vue_template__;\n'
    }

    cb(null, output)
  })
}

function checkLang (node) {
  if (node.attrs) {
    var i = node.attrs.length
    while (i--) {
      var attr = node.attrs[i]
      if (attr.name === 'lang') {
        return attr.value
      }
    }
  }
}

function checkSrc (node, filePath) {
  var dir = path.dirname(filePath)
  if (node.attrs) {
    var i = node.attrs.length
    while (i--) {
      var attr = node.attrs[i]
      if (attr.name === 'src') {
        var src = attr.value
        if (src) {
          try {
            return fs.readFileSync(path.resolve(dir, src), 'utf-8')
          } catch (e) {
            console.warn(
              'Failed to load src: "' + src +
              '" from file: "' + filePath + '"'
            )
          }
        }
      }
    }
  }
}

// Work around changes in parse5 >= 1.2.0
function serializeTemplate (node) {
  var childNode = node.childNodes[0]
  if (childNode && childNode.nodeName === '#document-fragment') {
    return serializer.serialize(childNode)
  }
  return serializer.serialize(node)
}
