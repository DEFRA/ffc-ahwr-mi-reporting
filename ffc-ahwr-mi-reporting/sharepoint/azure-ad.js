const { AdalFetchClient } = require('@pnp/nodejs-commonjs')
const config = require('../config/config')

const acquireToken = async () => {
  const adalFetchClient = new AdalFetchClient(
    config.sharePoint.tenantId,
    config.sharePoint.clientId,
    config.sharePoint.clientSecret
  )
  return await adalFetchClient.acquireToken()
}

module.exports = {
  acquireToken
}
