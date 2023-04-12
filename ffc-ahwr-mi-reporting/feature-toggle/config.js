const Joi = require('joi')

// Define config schema
const schema = Joi.object({
  sharePoint: {
    enabled: Joi.boolean().optional().default(false)
  }
})

// Build config
const config = {
  sharePoint: {
    enabled: process.env.SHAREPOINT_ENABLED
  }
}

// Validate config
const result = schema.validate(config, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The feature toggle config is invalid: ${result.error.message}`)
}

module.exports = result.value
