module.exports = {
  connectionString: process.env.STORAGE_CONNECTION_STRING,
  containerName: 'reports',
  tableName: 'ahwreventstore',
  notifyApiKey: process.env.NOTIFY_API_KEY,
  templateMiReport: process.env.MI_TEMPLATE_REPORT,
  miEmailAddress: process.env.MI_EMAIL_ADDRESS,
  environment: process.env.ENVIRONMENT ?? 'unknown'
}
