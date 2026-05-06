const Joi = require('joi')

function buildFeatureToggleConfig () {
  // Define config schema
  const schema = Joi.object({
    sharePoint: {
      enabled: Joi.boolean().optional().default(false)
    },
    poultryReleaseDate: Joi.string().optional()
  })

  // Build config
  const config = {
    sharePoint: {
      enabled: process.env.SHAREPOINT_ENABLED
    },
    poultryReleaseDate: process.env.POULTRY_RELEASE_DATE
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
