const convertToCSV = require('../convert-to-csv')
const createFileName = require('../create-filename')
const { writeFile } = require('../storage')
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
  await saveEligibilityCsv(parseEvents(events))
}

module.exports = buildEligibilityMiReport
