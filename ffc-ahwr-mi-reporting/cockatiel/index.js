const cockatiel = require('cockatiel')
const config = require('./config')

const retryPolicy = cockatiel.retry(
  cockatiel.handleAll,
  {
    maxAttempts: config.maxAttempts,
    backoff: new cockatiel.ExponentialBackoff()
  }
)

module.exports = config.enabled ? retryPolicy : cockatiel.noop
