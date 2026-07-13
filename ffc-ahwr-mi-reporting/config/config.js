const Joi = require('joi')
const featureToggle = require('../feature-toggle/config')

const schema = Joi.object({
  environment: Joi.string().default('unknown'),
  connectionString: Joi.string(),
  storageAccountName: Joi.string(),
  containerName: Joi.string().default('reports'),
  tableName: Joi.string().default('ahwreventstore'),
  sharePoint: Joi.object().default({}),
  featureToggle: Joi.object().required(),
  pageSize: Joi.number().integer().min(1).default(1000)
}).or('connectionString', 'storageAccountName')

const config = {
  environment: process.env.ENVIRONMENT,
  connectionString: process.env.STORAGE_CONNECTION_STRING,
  storageAccountName: process.env.STORAGE_ACCOUNT_NAME,
  sharePoint: featureToggle.sharePoint.enabled ? require('../sharepoint/config') : undefined,
  featureToggle,
  pageSize: process.env.PAGE_SIZE
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The config is invalid: ${result.error.message}`)
}

module.exports = result.value
