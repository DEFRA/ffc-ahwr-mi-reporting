const config = require('../config/config')
const createFileName = require('../csv/create-csv-filename')
const parseEvents = require('./parse-events')
const convertToCSV = require('../csv/convert-to-csv')
const storage = require('../storage/storage')
const msGraph = require('../sharepoint/ms-graph')

const buildAhwrEligibilityMiReport = async (events) => {
  const fileName = createFileName('ahwr-eligibility-mi-report')
  const dstFolder = `${config.sharePoint.dstFolder}/${config.environment}/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
  if (config.featureToggle.sharePoint.enabled) {
    console.log(`${new Date().toISOString()} Creating, storing and uploading AHWR Eligibility MI Report: ${JSON.stringify({
      dstFolder,
      fileName
    })}`)
  } else {
    console.log(`${new Date().toISOString()} Creating, storing but not uploading AHWR Eligibility MI Report: ${JSON.stringify({
      fileName
    })}`)
  }
  const rows = parseEvents(events)
  if (rows.length === 0) {
    console.log(`${new Date().toISOString()} No data found to create: ${JSON.stringify({ fileName })}`)
    return
  }
  const csvData = convertToCSV(rows)
  await storage.writeFile(fileName, csvData)
  if (config.featureToggle.sharePoint.enabled) {
    const fileContent = await storage.downloadFile(fileName)
    await msGraph.uploadFile(dstFolder, fileName, fileContent)
    console.log(`${new Date().toISOString()} AHWR Eligibility MI Report has been stored and uploaded: ${JSON.stringify({
      dstFolder,
      fileName
    })}`)
  } else {
    console.log(`${new Date().toISOString()} AHWR Eligibility MI Report has been stored but not uploaded: ${JSON.stringify({
      fileName
    })}`)
  }
}

module.exports = buildAhwrEligibilityMiReport
