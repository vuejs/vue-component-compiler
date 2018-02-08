const { struct } = require('superstruct')
const defaultsdeep = require('lodash.defaultsdeep')

const Source = struct.partial({
  code: 'string',
  map: 'object?',
  descriptor: 'object'
})

const ConfigStruct = struct.partial({
  async: 'boolean',
  needMap: 'boolean',
  onWarn: 'function',
  options: 'object',
  plugins: 'array',
  scopeId: 'string'
})

const Config = (value, defaults) => ConfigStruct(defaultsdeep(value, defaults))

module.exports = { Config, Source }
