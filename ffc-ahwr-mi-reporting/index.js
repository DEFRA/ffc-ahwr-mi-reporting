const { queryEntitiesByTimestamp, connect } = require('./storage/storage')
const buildMiReport = require('./mi-report')
const buildMiReportV2 = require('./mi-report-v2')
const buildMiReportV3 = require('./mi-report-v3')

module.exports = async (context, miReportTimer) => {
  await connect()
  const timeStamp = new Date().toISOString()
  context.log('Sourcing report data')
  const events = await queryEntitiesByTimestamp()
  if (events.length) {
    await buildMiReport(events)
    await buildMiReportV2(events)
    await buildMiReportV3(events)
  } else {
    context.log('No events found')
  }

  if (miReportTimer.isPastDue) {
    context.log('Node is running late')
  }

  context.log('Node timer trigger function ran', timeStamp)
}
