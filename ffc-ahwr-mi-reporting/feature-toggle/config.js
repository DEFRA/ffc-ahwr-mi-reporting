const Joi = require('joi')

function buildFeatureToggleConfig () {
  // Define config schema
  const schema = Joi.object({
    sharePoint: {
      enabled: Joi.boolean().optional().default(false)
    },
    pigsAndPaymentsReleaseDate: Joi.string().optional().default('2026-01-22')
  })

  // Build config
  const config = {
    sharePoint: {
      enabled: process.env.SHAREPOINT_ENABLED
    },
    pigsAndPaymentsReleaseDate: process.env.PIGS_AND_PAYMENTS_RELEASE_DATE
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
