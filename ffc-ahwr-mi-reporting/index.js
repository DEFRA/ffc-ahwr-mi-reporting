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
    try {
      await buildMiReport(events)
    } catch (e) {
      context.log('MI report failed : ', e)
    }

    try {
      await buildMiReportV2(events)
    } catch (e) {
      context.log('MI report V2 failed : ', e)
    }

    try {
      await buildMiReportV3(events)
    } catch (e) {
      context.log('MI report V3 failed : ', e)
    }
  } else {
    context.log('No events found')
  }

  if (miReportTimer.isPastDue) {
    context.log('Node is running late')
  }

  context.log('Node timer trigger function ran', timeStamp)
}
