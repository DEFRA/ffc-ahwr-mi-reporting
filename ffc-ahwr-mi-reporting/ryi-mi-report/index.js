const config = require('../config/config')
const createFileName = require('../csv/create-csv-filename')
const storage = require('../storage/storage')
const msGraph = require('../sharepoint/ms-graph')
const createRows = require('./create-rows')
const convertToCSV = require('../csv/convert-to-csv')

const buildAhwrRyiMiReport = async (events) => {
  const fileName = createFileName('ahwr-ryi-mi-report')
  const dstFolder = `${config.sharePoint.dstFolder}/${config.environment}/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
  if (config.featureToggle.sharePoint.enabled) {
    console.log(`${new Date().toISOString()} Creating, storing and uploading AHWR RYI MI Report: ${JSON.stringify({
      dstFolder,
      fileName
    })}`)
  } else {
    console.log(`${new Date().toISOString()} Creating, storing but not uploading AHWR RYI MI Report: ${JSON.stringify({
      fileName
    })}`)
  }

  const rows = createRows(events)
  if (rows.length === 0) {
    console.log(`${new Date().toISOString()} No data found to create: ${JSON.stringify({ fileName })}`)
    return
  }

  const csvData = convertToCSV(rows)

  await storage.writeFile(fileName, csvData)
  if (config.featureToggle.sharePoint.enabled) {
    const fileContent = await storage.downloadFile(fileName)
    await msGraph.uploadFile(dstFolder, fileName, fileContent)
    console.log(`${new Date().toISOString()} AHWR RYI MI Report has been stored and uploaded: ${JSON.stringify({
      dstFolder,
      fileName
    })}`)
  } else {
    console.log(`${new Date().toISOString()} AHWR RYI MI Report has been stored but not uploaded: ${JSON.stringify({
      fileName
    })}`)
  }
}

module.exports = buildAhwrRyiMiReport
