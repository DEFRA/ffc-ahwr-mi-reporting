const featureToggle = require('../feature-toggle/config')

module.exports = {
  environment: process.env.ENVIRONMENT ?? 'unknown',
  connectionString: process.env.STORAGE_CONNECTION_STRING,
  containerName: 'reports',
  tableName: 'ahwreventstore',
  sharePoint: featureToggle.sharePoint.enabled ? require('../sharepoint/config') : {},
  featureToggle
}
