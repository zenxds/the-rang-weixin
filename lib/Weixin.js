const extend = require('extend2')
const request = require('request-promise-native')
const Cache = require('lru-cache')
const { sha1 } = require('./crypto')

async function fetch(cfg) {
  return request(cfg).then(result => {
    if (result && 0 === result.errcode) {
      return result
    } else {
      throw new Error(result ? `${result.errcode}: ${result.errmsg}` : `请求${cfg.url}失败`)
    }
  })
}

/**
 * 随机字符串
 */
const createNonceStr = () => {
  return Math.random().toString(36).substr(2, 15)
}

const createTimestamp = () => {
  return parseInt(Date.now() / 1000) + ''
}

const param = args => {
  const keys = Object.keys(args)
  
  // 要按ASCII排序
  return keys.sort().map((key) => {
    return `${key.toLowerCase()}=${args[key]}`
  }).join('&')
}

class Weixin {
  constructor(options={}) {
    options = extend(true, {
      apiServer: 'https://api.weixin.qq.com/cgi-bin',
      appid: '',
      secret: ''
    }, options)

    this.appid = options.appid
    this.secret = options.secret
    this.apiServer = options.apiServer

    this.fetch = fetch
    this.cache = new Cache({
      max: 100,
      maxAge: 1000 * 60 * 10
    })
  }

  async getAccessToken() {
    const key = 'weixin_access_token'
    const { cache, appid, secret, apiServer } = this
  
    let token = cache.get(key)
    if (token) {
      return token
    }
  
    const result = await fetch({
      url: `${apiServer}/token`,
      qs: {
        grant_type: 'client_credential',
        appid, 
        secret
      },
      json: true
    })
  
    // 考虑到网络传输延迟，过期时间减去一点
    cache.set(key, result.access_token, (result.expires_in - 5) * 1000)
    return result.access_token
  }

  /**
   * 获取js ticket
   */
  async getJSTicket() {
    const key = 'weixin_js_ticket'
    const { cache, apiServer } = this
  
    let ticket = cache.get(key)
    if (ticket) {
      return ticket
    }

    const result = await fetch({
      url: `${apiServer}/ticket/getticket`,
      qs: {
        type: 'jsapi',
        access_token: await this.getAccessToken()
      },
      json: true
    })
  
    // 考虑到网络传输延迟，过期时间减去一点
    cache.set(key, result.ticket, (result.expires_in - 5) * 1000)
    return result.ticket
  }

  /**
  * @synopsis 签名算法 
  *
  * @param jsapi_ticket 用于签名的 jsapi_ticket
  * @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
  *
  * @returns
  */
  sign(ticket, url) {
    const params = {
      jsapi_ticket: ticket,
      nonceStr: createNonceStr(),
      timestamp: createTimestamp(),
      url: url
    }

    const ret = {
      timestamp: params.timestamp,
      nonceStr: params.nonceStr,
      signature: sha1(param(params))
    }
    return ret
  }
}

module.exports = Weixin
