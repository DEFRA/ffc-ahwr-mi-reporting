const cockatiel = require('cockatiel')
const config = require('./config')

const retryPolicy = cockatiel.retry(
  cockatiel.handleAll,
  {
    maxAttempts: config.maxAttempts,
    backoff: new cockatiel.ExponentialBackoff()
  }
)

const circuitBreakerPolicy = cockatiel.circuitBreaker(
  cockatiel.handleAll,
  {
    halfOpenAfter: config.halfOpenAfter,
    breaker: new cockatiel.ConsecutiveBreaker(config.consecutiveBreaker)
  }
)

module.exports = config.enabled ? cockatiel.wrap(retryPolicy, circuitBreakerPolicy) : cockatiel.noop
