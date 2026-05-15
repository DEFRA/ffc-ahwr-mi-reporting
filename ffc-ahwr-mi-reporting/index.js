const buildAhwrMiReport = require('./mi-report-v3')

async function runMiReport (context, miReportTimer) {
  const timeStamp = new Date().toISOString()
  context.log('MI Report timer trigger function started', timeStamp)

  try {
    await buildAhwrMiReport(context)
  } catch (error) {
    context.log.error('Failed to build mi report', {
      error
    })
    throw error
  }

  if (miReportTimer.isPastDue) {
    context.log('Node is running late')
  }

  context.log('MI Report timer trigger function ran', timeStamp)
}

module.exports = runMiReport
