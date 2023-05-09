const config = require('../config/config')
const createFileName = require('../csv/create-csv-filename')
const storage = require('../storage/storage')
const msGraph = require('../sharepoint/ms-graph')
const createDstFoldername = require('../sharepoint/create-dst-foldername')
const createRows = require('./create-rows')
const convertToCSV = require('../csv/convert-to-csv')

const buildAhwrRyiMiReport = async (events) => {
  const fileName = createFileName('ahwr-ryi-mi-report')
  console.log(`${new Date().toISOString()} ahwr-ryi-mi-report: Creating a CSV file: ${JSON.stringify({
    fileName
  })}`)
  const rows = createRows(events)
  if (rows.length === 0) {
    console.log(`${new Date().toISOString()} ahwr-ryi-mi-report: No data found to create a CSV file: ${JSON.stringify({ fileName })}`)
    return
  }
  const csvData = convertToCSV(rows)
  await storage.writeFile(fileName, csvData)
  console.log(`${new Date().toISOString()} ahwr-ryi-mi-report: CSV file has been uploaded to Azure Storage: ${JSON.stringify({
    fileName
  })}`)
  if (config.featureToggle.sharePoint.enabled) {
    const dstFolder = createDstFoldername()
    const fileContent = await storage.downloadFile(fileName)
    await msGraph.uploadFile(dstFolder, fileName, fileContent)
    console.log(`${new Date().toISOString()} ahwr-ryi-mi-report: CSV file has been uploaded to SharePoint: ${JSON.stringify({
      dstFolder,
      fileName
    })}`)
  } else {
    console.log(`${new Date().toISOString()} ahwr-ryi-mi-report: SharePoint upload disabled ${JSON.stringify({
      fileName
    })}`)
  }
}

module.exports = buildAhwrRyiMiReport
