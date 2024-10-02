const { queryEntitiesByTimestamp, connect } = require('./storage/storage')
const buildAhwrMiReportV3 = require('./mi-report-v3')

module.exports = async (context, miReportTimer) => {
  // Step 1: Connect to storage
  await connect()
  const timeStamp = new Date().toISOString()
  context.log('Sourcing report data')

  // Step 2: Query events from Azure Table Storage
  const events = await queryEntitiesByTimestamp()

  if (events.length) {
    try {
      // Step 3: Build and store AHWR MI Report V3
      await buildAhwrMiReportV3(events)
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
