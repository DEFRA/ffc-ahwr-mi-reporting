const { queryEntitiesByTimestamp, connect } = require('./storage/storage')
const buildMiReport = require('./mi-report')
const buildEligibilityMiReport = require('./eligibility-mi-report')
const buildAhwrRyiMiReport = require('./ryi-mi-report')

module.exports = async (context, miReportTimer) => {
  await connect()
  const timeStamp = new Date().toISOString()
  context.log('Sourcing report data')
  const events = await queryEntitiesByTimestamp()
  if (events.length) {
    await buildMiReport(events)
    await buildEligibilityMiReport(events)
  } else {
    context.log('No events found')
  }

  await buildAhwrRyiMiReport(await queryEntitiesByTimestamp('ffcahwrregisteryourinterest'))

  if (miReportTimer.isPastDue) {
    context.log('Node is running late')
  }

  context.log('Node timer trigger function ran', timeStamp)
}
