module.exports = {
  connectionString: process.env.STORAGE_CONNECTION_STRING,
  containerName: 'reports',
  tableName: 'ahwreventstore',
  templateMiReport: process.env.MI_TEMPLATE_REPORT,
  templateEligibilityMiReport: process.env.ELIGIBILITY_MI_TEMPLATE_REPORT,
  miEmailAddress: process.env.MI_EMAIL_ADDRESS,
  environment: process.env.ENVIRONMENT ?? 'unknown',
  sharePoint: require('../sharepoint/config')
}
