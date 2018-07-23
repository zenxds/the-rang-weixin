const crypto = require('crypto')

exports.sha1 = str => {
  const hash = crypto.createHash('sha1')
  hash.update(str)
  return hash.digest('hex')
}

exports.md5 = str => {
  const hash = crypto.createHash('md5')
  hash.update(str)
  return hash.digest('hex')
}