const buildAhwrMiReport = require('./mi-report-v3')

module.exports = async (context, miReportTimer) => {
  const timeStamp = new Date().toISOString()
  context.log('MI Report timer trigger function started', timeStamp)

  try {
    await buildAhwrMiReport(context)
  } catch (e) {
    context.log.error('MI report V3 failed: ', e)
    const errorMessage = 'Failed to build MI Report'
    context.res = {
      status: 500,
      body: errorMessage
    }

    throw new Error(errorMessage)
  }

  if (miReportTimer.isPastDue) {
    context.log('Node is running late')
  }

  context.log('MI Report timer trigger function ran', timeStamp)
}
