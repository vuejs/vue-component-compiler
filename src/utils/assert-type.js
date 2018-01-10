module.exports = function (values, type) {
  Object.keys(values).forEach(it => {
    if (typeof values[it] !== type || type === null) {
      throw Error(`'${it}' should be of type ${type}.`)
    }
  })
}
