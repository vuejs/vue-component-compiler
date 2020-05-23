module.exports = {
  moduleFileExtensions: ['js', 'json', 'png', 'ts', 'vue'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
    '.*.(js|vue|png)$': './test/setup/jest-helper.js'
  },
  testMatch: ['**/?(*.)(spec|test).ts']
}
