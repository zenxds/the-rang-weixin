const config = require('config')
const Weixin = require('../lib/Weixin')

const weixin = new Weixin(config.get('weixin'))

describe('weixin', () => {

  test('it should init', () => {
    expect(weixin.apiServer).toBeTruthy()
    expect(weixin.cache).toBeTruthy()
  })

  xtest('it should get access token', async() => {
    let token = await weixin.getAccessToken()

    expect(token).toBeTruthy()
  })

  xtest('it should get js ticket', async() => {
    let ticket = await weixin.getJSTicket()

    expect(ticket).toBeTruthy()
  })

  xtest('it should sign ticket', async() => {
    let ticket = await weixin.getJSTicket()
    let sign = weixin.signTicket(ticket, 'https://growth.dingxiang-inc.com')

    expect(sign.ticket).toBe(ticket)
    expect(sign.signature).toBeTruthy()
  })
})