const convertToCSV = require('../csv/convert-to-csv')
const createFileName = require('../csv/create-filename')
const { writeFile } = require('../storage/storage')
const { sendEligibilityReport } = require('../email/notify-send')
const parseEvents = require('./parse-events')

const buildEligibilityMiReport = async (events) => {
  const parsedEvents = parseEvents(events)
  if (parseEvents.length === 0) {
    console.log('No data to create CSV')
    return
  }
  const csvData = convertToCSV(parsedEvents)
  const csvFilename = createFileName('ahwr-eligibility-mi-report.csv')
  await writeFile(csvFilename, csvData)
  await sendEligibilityReport()
  console.log('CSV saved')
}

module.exports = buildEligibilityMiReport
