module.exports = {
  environment: process.env.ENVIRONMENT ?? 'unknown',
  connectionString: process.env.STORAGE_CONNECTION_STRING,
  containerName: 'reports',
  tableName: 'ahwreventstore',
  sharePoint: require('../sharepoint/config'),
  featureToggle: require('../feature-toggle/config')
}
