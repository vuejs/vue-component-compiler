module.exports = {
  moduleFileExtensions: ['js', 'json', 'png', 'ts', 'vue'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': '<rootDir>/node_modules/ts-jest/preprocessor.js',
    '.*.(js|vue|png)$': './test/setup/jest-helper.js'
  },
  testMatch: ['**/?(*.)(spec|test).ts']
}
