const Joi = require('joi')

function buildFeatureToggleConfig () {
  // Define config schema
  const schema = Joi.object({
    sharePoint: {
      enabled: Joi.boolean().optional().default(false)
    },
    filterUnnecessaryEventTypes: Joi.boolean().required()
  })

  // Build config
  const config = {
    sharePoint: {
      enabled: process.env.SHAREPOINT_ENABLED
    },
    filterUnnecessaryEventTypes: process.env.FILTER_UNNECESSARY_EVENT_TYPES === 'true'
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
