const config = require('../config/config')
const createFileName = require('../csv/create-csv-filename')
const storage = require('../storage/storage')
const msGraph = require('../sharepoint/ms-graph')
const transformJsonToCsvV3 = require('./transformJsonToCsvV3')

const buildAhwrMiReportV3 = async (events, version = '3') => {
  const fileName = createFileName(`ahwr-mi-report-v${version}-`)
  const dstFolder = `${config.sharePoint.dstFolder}/${config.environment}/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
  if (config.featureToggle.sharePoint.enabled) {
    console.log(`${new Date().toISOString()} Creating, storing and uploading AHWR MI Report V${version}: ${JSON.stringify({
      dstFolder,
      fileName
    })}`)
  } else {
    console.log(`${new Date().toISOString()} Creating, storing but not uploading AHWR MI Report V${version}: ${JSON.stringify({
      fileName
    })}`)
  }
  const csvData = transformJsonToCsvV3(events)
  if (csvData.length === 0) {
    console.log(`${new Date().toISOString()} No data found to create: ${JSON.stringify({ fileName })}`)
    return
  }
  await storage.writeFile(fileName, csvData)
  if (config.featureToggle.sharePoint.enabled) {
    const fileContent = await storage.downloadFile(fileName)
    await msGraph.uploadFile(dstFolder, fileName, fileContent)
    console.log(`${new Date().toISOString()} AHWR MI Report V${version} has been stored and uploaded: ${JSON.stringify({
      dstFolder,
      fileName
    })}`)
  } else {
    console.log(`${new Date().toISOString()} AHWR MI Report V${version} has been stored but not uploaded: ${JSON.stringify({
      fileName
    })}`)
  }
}

module.exports = buildAhwrMiReportV3
