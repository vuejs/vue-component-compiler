var htmlMinifier = require("html-minifier")
var cssMinifier = new require('clean-css')()
var parse5 = require('parse5')
var parser = new parse5.Parser()
var serializer = new parse5.TreeSerializer()
var async = require('async')

exports.compile = function (content, cb) {

  var script
  var style
  var template
  var output = ''
  var jobs = []

  var fragment = parser.parseFragment(content)
  fragment.childNodes.forEach(function (node) {
    switch (node.nodeName) {
      case 'style':
        style = serializer.serialize(node)
        var lang = checkLang(node)
        if (lang === 'scss') {
          lang = 'sass'
        }
        if (lang !== 'less' && lang !== 'sass' && lang !== 'stylus') {
          break
        }
        jobs.push(function (done) {
          require('./compilers/' + lang)(style, function (err, res) {
            style = res
            done(err)
          })
        })
        break
      case 'template':
        template = serializeTemplate(node)
        if (checkLang(node) === 'jade') {
          jobs.push(function (done) {
            require('./compilers/jade')(template, function (err, res) {
              template = res
              done(err)
            })
          })
        }
        break
      case 'script':
        script = serializer.serialize(node).trim()
        if (checkLang(node) === 'coffee') {
          jobs.push(function (done) {
            require('./compilers/coffee')(script, function (err, res) {
              script = res
              done(err)
            })
          })
        }
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

// Work around changes in parse5 >= 1.2.0
function serializeTemplate (node) {
  var childNode = node.childNodes[0]
  if (childNode && childNode.nodeName === '#document-fragment') {
    return serializer.serialize(childNode)
  }
  return serializer.serialize(node)
}
