const config = require('../config/config')
const createRows = require('./create-rows')
const convertToCSV = require('../csv/convert-to-csv')
const createFileName = require('../csv/create-csv-filename')
const storage = require('../storage/storage')
const msGraph = require('../sharepoint/ms-graph')

const buildAhwrMiReport = async (events) => {
  const fileName = createFileName('ahwr-mi-report')
  const dstFolder = `${config.sharePoint.dstFolder}/${config.environment}/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
  if (config.featureToggle.sharePoint.enabled) {
    console.log(`${new Date().toISOString()} Creating, storing and uploading AHWR MI Report: ${JSON.stringify({
      dstFolder,
      fileName
    })}`)
  } else {
    console.log(`${new Date().toISOString()} Creating, storing but not uploading AHWR MI Report: ${JSON.stringify({
      fileName
    })}`)
  }
  const rows = await createRows(events)
  if (rows.length === 0) {
    console.log(`${new Date().toISOString()} No data found to create: ${JSON.stringify({ fileName })}`)
    return
  }
  const csvData = convertToCSV(rows)
  await storage.writeFile(fileName, csvData)
  if (config.featureToggle.sharePoint.enabled) {
    const fileContent = await storage.downloadFile(fileName)
    await msGraph.uploadFile(dstFolder, fileName, fileContent)
    console.log(`${new Date().toISOString()} AHWR MI Report has been stored and uploaded: ${JSON.stringify({
      dstFolder,
      fileName
    })}`)
  } else {
    console.log(`${new Date().toISOString()} AHWR MI Report has been stored but not uploaded: ${JSON.stringify({
      fileName
    })}`)
  }
}

module.exports = buildAhwrMiReport
