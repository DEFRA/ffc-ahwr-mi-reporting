const { queryEntitiesByTimestamp, connect } = require('./storage/storage')
const buildMiReport = require('./mi-report')
const buildEligibilityMiReport = require('./eligibility-mi-report')
const { getApplications } = require('./api/applications')

module.exports = async (context, miReportTimer) => {
  await connect()
  const timeStamp = new Date().toISOString()
  context.log('Sourcing report data')
  const events = await queryEntitiesByTimestamp()
  const applications = await getApplications()
  if (events.length) {
    context.log('Report creation started', timeStamp)
    await buildMiReport(events, applications)
    await buildEligibilityMiReport(events)
  } else {
    context.log('No events found')
  }

  if (miReportTimer.isPastDue) {
    context.log('Node is running late')
  }

  context.log('Node timer trigger function ran', timeStamp)
}
