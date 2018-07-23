const Weixin = require('./Weixin')

module.exports = function(options={}) {
  return {
    service: new Weixin(options)
  }
}