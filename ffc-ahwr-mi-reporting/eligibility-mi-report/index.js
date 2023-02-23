const convertToCSV = require('../csv/convert-to-csv')
const createFileName = require('../csv/create-filename')
const { writeFile } = require('../storage/storage')
const { sendEligibilityReport } = require('../email/notify-send')
const parseEvents = require('./parse-events')

const saveEligibilityCsv = async (miParsedData) => {
  if (miParsedData) {
    const csvData = convertToCSV(miParsedData)
    await writeFile(createFileName('ahwr-eligibility-mi-report.csv'), csvData)
    await sendEligibilityReport()
    console.log('CSV saved')
  } else {
    console.log('No data to create CSV')
  }
}

const buildEligibilityMiReport = async (events) => {
  const parsedEvents = parseEvents(events)
  parsedEvents.sort((a, b) => new Date(b.registrationOfInterestTimestamp) - new Date(a.registrationOfInterestTimestamp))
  await saveEligibilityCsv(parsedEvents)
}

module.exports = buildEligibilityMiReport
