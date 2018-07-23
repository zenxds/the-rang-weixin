const Weixin = require('./Weixin')

module.exports = function(options={}) {

  const weixin = new Weixin(options)

  return {
    service: weixin
  }
}