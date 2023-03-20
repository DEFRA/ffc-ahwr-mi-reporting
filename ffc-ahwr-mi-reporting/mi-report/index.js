const { writeFile } = require('../storage/storage')
const createFileName = require('../csv/create-filename')
const { send } = require('../email/notify-send')
const convertToCSV = require('../csv/convert-to-csv')
const createRows = require('./create-rows')

const saveCsv = async (miParsedData) => {
  if (miParsedData) {
    const csvData = convertToCSV(miParsedData)
    console.log(csvData)
    await writeFile(createFileName('ahwr-mi-report.csv'), csvData)
    await send()
    console.log('CSV saved')
  } else {
    console.log('No data to create CSV')
  }
}

const buildMiReport = async (events, applications) => {
  const rows = createRows(events, applications)
  await saveCsv(rows)
}

module.exports = buildMiReport
