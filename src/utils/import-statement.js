const _s = require('./stringify')

module.exports = function importStatement (id, { type, name, esModule, noIdentifier = false }) {
  const header = type ? `\n/* ${type} */\n` : ''
  name = name || `__vue_${type}__`

  if (!id) return header + `var ${name} = null\n`

  if (esModule) {
    return header + (
      noIdentifier ? `import ${_s(id)}\n` : `import ${name} from ${_s(id)}\n`
    )
  }

  return header + (
    noIdentifier ? `require(${_s(id)})\n` : `var ${name} = require(${_s(id)})\n`
  )
}
