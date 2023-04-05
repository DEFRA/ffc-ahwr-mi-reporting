const config = require('../config/config')
const createRows = require('./create-rows')
const convertToCSV = require('../csv/convert-to-csv')
const createFileName = require('../csv/create-csv-filename')
const storage = require('../storage/storage')
const msGraph = require('../sharepoint/ms-graph')

const buildAhwrMiReport = async (events) => {
  const fileName = createFileName('ahwr-mi-report')
  const dstFolder = `${config.sharePoint.dstFolder}/${config.environment}/${new Date().getFullYear()}/${new Date().getMonth() + 1}`
  console.log(`${new Date().toISOString()} Creating and uploading AHWR MI Report: ${JSON.stringify({
    dstFolder,
    fileName
  })}`)
  const rows = createRows(events)
  if (rows.length === 0) {
    console.log(`${new Date().toISOString()} No data found to create: ${JSON.stringify({ fileName })}`)
    return
  }
  const csvData = convertToCSV(rows)
  await storage.writeFile(fileName, csvData)
  const fileContent = await storage.downloadFile(fileName)
  await msGraph.uploadFile(dstFolder, fileName, fileContent)
  console.log(`${new Date().toISOString()} AHWR MI Report has been uploaded: ${JSON.stringify({
    dstFolder,
    fileName
  })}`)
}

module.exports = buildAhwrMiReport
