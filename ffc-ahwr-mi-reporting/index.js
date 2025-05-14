const buildAhwrMiReport = require('./mi-report-v3')

module.exports = async (context, miReportTimer) => {
  const timeStamp = new Date().toISOString()
  context.log('MI Report timer trigger function started', timeStamp)

  await buildAhwrMiReport(context)

  if (miReportTimer.isPastDue) {
    context.log('Node is running late')
  }

  context.log('MI Report timer trigger function ran', timeStamp)
}
