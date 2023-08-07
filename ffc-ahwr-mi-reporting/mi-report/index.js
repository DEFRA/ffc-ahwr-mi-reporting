const config = require('../config/config')
const createRows = require('./create-rows')
const convertToCSV = require('../csv/convert-to-csv')
const createFileName = require('../csv/create-csv-filename')
const storage = require('../storage/storage')
const msGraph = require('../sharepoint/ms-graph')
const createDstFoldername = require('../sharepoint/create-dst-foldername')
const reportName = require('./report-name')

const buildAhwrMiReport = async (events) => {
  const fileName = createFileName(reportName)
  console.log(`${new Date().toISOString()} ${reportName}: Creating a CSV file: ${JSON.stringify({ fileName })}`)
  const rows = createRows(events)
  if (rows.length === 0) {
    console.log(`${new Date().toISOString()} ${reportName}: No data found to create a CSV file: ${JSON.stringify({ fileName })}`)
    return
  }
  const csvData = convertToCSV(rows)
  await storage.writeFile(fileName, csvData)
  console.log(`${new Date().toISOString()} ${reportName}: CSV file has been uploaded to Azure Storage: ${JSON.stringify({ fileName })}`)
  if (config.featureToggle.sharePoint.enabled) {
    const dstFolder = createDstFoldername()
    const fileContent = await storage.downloadFile(fileName)
    await msGraph.uploadFile(dstFolder, fileName, fileContent)
    console.log(`${new Date().toISOString()} ${reportName}: CSV file has been uploaded to SharePoint: ${JSON.stringify({ fileName, dstFolder })}`)
  } else {
    console.log(`${new Date().toISOString()} ${reportName}: SharePoint disabled`)
  }
}

module.exports = buildAhwrMiReport
