const { queryEntitiesByTimestamp, connect } = require('./storage')
const buildMiReport = require('./mi-report')

module.exports = async (context, miReportTimer) => {
  connect()
  const timeStamp = new Date().toISOString()
  context.log('Sourcing report data')
  const events = await queryEntitiesByTimestamp()
  if (events.length) {
    context.log('Report creation started', timeStamp)
    buildMiReport(events)
  }

  if (miReportTimer.isPastDue) {
    context.log('Node is running late')
  }
  context.log('Node timer trigger function ran', timeStamp)
}
