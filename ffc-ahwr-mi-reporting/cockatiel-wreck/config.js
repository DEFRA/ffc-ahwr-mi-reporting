const Joi = require('joi')

const schema = Joi.object({
  maxAttempts: Joi.number().optional().default(3),
  halfOpenAfter: Joi.number().optional().default(10 * 1000),
  consecutiveBreaker: Joi.number().optional().default(5),
  enabled: Joi.boolean().optional().default(false)
})

const config = {
  maxAttempts: process.env.COCKATIEL_MAX_ATTEMPTS,
  halfOpenAfter: process.env.COCKATIEL_HALF_OPEN_AFTER,
  consecutiveBreaker: process.env.COCKATIEL_CONSECUTIVE_BREAKER,
  enabled: process.env.COCKATIEL_ENABLED
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The cockatiel config is invalid: ${result.error.message}`)
}

module.exports = result.value
