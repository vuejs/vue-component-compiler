const { struct } = require('superstruct')
const defaultsdeep = require('lodash.defaultsdeep')

const Source = struct({
  script: struct.optional({
    id: struct.union(['string?', 'null']),
    code: struct.union(['string?', 'null']),
    map: 'object?',
    descriptor: struct.union(['object', 'null'])
  }),
  render: struct.optional({
    id: struct.union(['string?', 'null']),
    code: struct.union(['string?', 'null']),
    map: 'object?',
    descriptor: struct.union(['object', 'null'])
  }),
  styles: struct.optional(struct.list([
    {
      id: struct.union(['string?', 'null']),
      code: struct.union(['string?', 'null']),
      map: 'object?',
      modules: 'object?',
      descriptor: struct.union(['object', 'null'])
    }
  ])),
  customBlocks: struct.optional(struct.list([
    {
      id: 'string?',
      code: 'string?',
      map: 'object?',
      descriptor: struct.union(['object', 'null'])
    }
  ]))
})

const ConfigStruct = struct.partial({
  esModule: 'boolean',
  require: 'object',
  scopeId: 'string',
  moduleIdentifier: 'string?',
  hot: struct.optional({
    isHot: 'function?',
    accept: 'function?',
    dispose: 'function?'
  }),
  isHot: 'boolean?',
  isServer: 'boolean',
  isProduction: 'boolean',
  hasStyleInjectFn: 'boolean',
  onWarn: 'function'
})

const Config = (value, defaults) => ConfigStruct(defaultsdeep(value, defaults))

module.exports = { Config, Source }
