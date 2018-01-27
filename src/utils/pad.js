module.exports = function pad (content) {
  return (
    content
      .trim()
      .split(/\n\r?/)
      .map(line => '  ' + line)
      .join('\n') + '\n'
  )
}
