const { queryEntitiesByTimestamp, connect } = require('./storage/storage')
const buildMiReportV3 = require('./mi-report-v3')

module.exports = async (context, miReportTimer) => {
  await connect()
  const timeStamp = new Date().toISOString()
  context.log('Sourcing report data')
  const events = await queryEntitiesByTimestamp()
  if (events.length) {
    try {
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
