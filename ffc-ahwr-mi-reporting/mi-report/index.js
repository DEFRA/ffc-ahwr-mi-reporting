const createRows = require('./create-rows')
const convertToCSV = require('../csv/convert-to-csv')
const createFileName = require('../csv/create-filename')
const storage = require('../storage/storage')
const msGraph = require('../sharepoint/ms-graph')

const buildMiReport = async (events) => {
  const rows = createRows(events)
  if (rows.length === 0) {
    console.log('No data to create CSV')
    return
  }
  const csvData = convertToCSV(rows)
  await storage.writeFile(createFileName('ahwr-mi-report.csv'), csvData)
  const fileContent = await storage.downloadFile(createFileName('ahwr-mi-report.csv'))
  await msGraph.uploadFile('/test-dir', 'ahwr-mi-report.csv', fileContent)
  console.log('CSV saved')
}

module.exports = buildMiReport
