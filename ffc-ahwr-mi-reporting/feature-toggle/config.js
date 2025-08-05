const Joi = require('joi')

function buildFeatureToggleConfig () {
  // Define config schema
  const schema = Joi.object({
    sharePoint: {
      enabled: Joi.boolean().optional().default(false)
    },
    pigUpdates: {
      enabled: Joi.boolean().optional().default(false)
    }
  })

  // Build config
  const config = {
    sharePoint: {
      enabled: process.env.SHAREPOINT_ENABLED
    },
    pigUpdates: {
      enabled: process.env.PIG_UPDATES_ENABLED === 'true'
    }
  }

  // Validate config
  const result = schema.validate(config, {
    abortEarly: false
  })

  // Throw if config is invalid
  if (result.error) {
    throw new Error(
      `The feature toggle config is invalid: ${result.error.message}`
    )
  }

  return config
}

module.exports = buildFeatureToggleConfig()
