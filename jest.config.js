module.exports = {
  moduleFileExtensions: [
    'js',
    'json',
    'png',
    'vue'
  ],
  transform: {
    '.*\.(js|vue|png)$': './test/setup/jest-helper.js'
  },
  testRegex: '.*\.spec.js'
}
