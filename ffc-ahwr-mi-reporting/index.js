const { queryEntitiesByTimestamp, queryEntitiesByTimestampByDate, connect } = require('./storage/storage')
const buildMiReportV3 = require('./mi-report-v3')

module.exports = async (context, miReportTimer) => {
  await connect()
  const timeStamp = new Date().toISOString()
  context.log('Sourcing report data')
  const events = await queryEntitiesByTimestampByDate()
  if (events.length) {
    try {
      await buildMiReportV3(events,4)
    } catch (e) {
      context.log('MI report V4 failed: ', e)
    }
    try {
      const events = await queryEntitiesByTimestamp()
      await buildMiReportV3(events)
    } catch (e) {
      context.log('MI report V3 failed: ', e)
    }
  } else {
    context.log('No events found')
  }

  if (miReportTimer.isPastDue) {
    context.log('Node is running late')
  }

  context.log('Node timer trigger function ran', timeStamp)
}
