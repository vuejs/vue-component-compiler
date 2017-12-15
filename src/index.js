module.exports = {
  parse: require('./parser'),
  compileStyle: require('./style-compiler'),
  compileTemplate: require('./template-compiler'),
  assemble: require('./assemble'),
  generateScopeId: require('./gen-id')
}
