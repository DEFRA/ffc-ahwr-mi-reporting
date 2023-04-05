const config = require('../config/config')
const createFileName = require('../csv/create-csv-filename')
const parseEvents = require('./parse-events')
const convertToCSV = require('../csv/convert-to-csv')
const storage = require('../storage/storage')
const msGraph = require('../sharepoint/ms-graph')

const buildAhwrEligibilityMiReport = async (events) => {
  const fileName = createFileName('ahwr-eligibility-mi-report')
  const dstFolder = `${config.sharePoint.dstFolder}/${config.environment}/${new Date().getFullYear()}/${new Date().getMonth() + 1}`
  console.log(`${new Date().toISOString()} Creating and uploading AHWR Eligibility MI Report: ${JSON.stringify({
    dstFolder,
    fileName
  })}`)
  const rows = parseEvents(events)
  if (rows.length === 0) {
    console.log(`${new Date().toISOString()} No data found to create: ${JSON.stringify({ fileName })}`)
    return
  }
  const csvData = convertToCSV(rows)
  await storage.writeFile(fileName, csvData)
  const fileContent = await storage.downloadFile(fileName)
  await msGraph.uploadFile(dstFolder, fileName, fileContent)
  console.log(`${new Date().toISOString()} AHWR Eligibility MI Report has been uploaded: ${JSON.stringify({
    dstFolder,
    fileName
  })}`)
}

module.exports = buildAhwrEligibilityMiReport
