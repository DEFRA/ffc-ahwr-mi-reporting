const Joi = require('joi')

// Define config schema
const schema = Joi.object({
  maxAttempts: Joi.number().optional().default(3),
  enabled: Joi.boolean().optional().default(false)
})

// Build config
const config = {
  maxAttempts: process.env.COCKATIEL_MAX_ATTEMPTS,
  enabled: process.env.COCKATIEL_ENABLED
}

// Validate config
const result = schema.validate(config, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The cockatiel config is invalid: ${result.error.message}`)
}

module.exports = result.value
