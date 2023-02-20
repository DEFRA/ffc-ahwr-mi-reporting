const { queryEntitiesByTimestamp, connect } = require('./storage')
const { buildMiReport, buildEligibilityMiReport } = require('./mi-report')

module.exports = async (context, miReportTimer) => {
  await connect()
  const timeStamp = new Date().toISOString()
  context.log('Sourcing report data')
  const events = await queryEntitiesByTimestamp()
  if (events.length) {
    context.log('Report creation started', timeStamp)
    await buildMiReport(events)
    await buildEligibilityMiReport(events)
  } else {
    context.log('No events found')
  }

  if (miReportTimer.isPastDue) {
    context.log('Node is running late')
  }

  context.log('Node timer trigger function ran', timeStamp)
}
