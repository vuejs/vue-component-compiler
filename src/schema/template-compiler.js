const { struct } = require('superstruct')
const defaultsdeep = require('lodash.defaultsdeep')

const Source = struct.partial({
  code: 'string',
  map: 'object?',
  descriptor: 'object'
})

const ConfigStruct = struct.partial({
  scopeId: 'string',
  isServer: 'boolean',
  isProduction: 'boolean',
  esModule: 'boolean',
  optimizeSSR: 'boolean',
  buble: 'object',
  options: 'object',
  transformRequire: 'object?',
  plugins: 'array'
})

const Config = (value, defaults) => ConfigStruct(defaultsdeep(value, defaults))

module.exports = { Config, Source }
