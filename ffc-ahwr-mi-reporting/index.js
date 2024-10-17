const buildAhwrMiReport = require('./mi-report-v3')

module.exports = async (context, miReportTimer) => {
  const timeStamp = new Date().toISOString()
  context.log('MI Report timer trigger function started', timeStamp)

  try {
    await buildAhwrMiReport()
  } catch (e) {
    context.log('MI report V3 failed: ', e)
  }

  if (miReportTimer.isPastDue) {
    context.log('Node is running late')
  }

  context.log('MI Report timer trigger function ran', timeStamp)
}
