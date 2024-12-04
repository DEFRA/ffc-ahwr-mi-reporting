const config = require('../config/config')
const createFileName = require('../csv/create-csv-filename')
const msGraph = require('../sharepoint/ms-graph')

const { streamBlobToFile, processEntitiesByTimestampPaged, connect } = require('../storage/storage')

const buildAhwrMiReport = async (context) => {
  const fileName = createFileName('ahwr-mi-report-v3-')
  const dstFolder = `${config.sharePoint.dstFolder}/${config.environment}/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
  const logUploadIndicator = config.featureToggle.sharePoint.enabled ? 'and' : 'but not'
  const logDstFolder = config.featureToggle.sharePoint.enabled ? dstFolder : ''

  context.log.info(`Creating, storing ${logUploadIndicator} uploading AHWR MI Report V3: ${logDstFolder} ${fileName}`)

  await connect(context)
  await processEntitiesByTimestampPaged(null, fileName, context)

  if (config.featureToggle.sharePoint.enabled) {
    // Read the file from the local file system
    const fileContent = await streamBlobToFile(fileName) // Read the file from the local path

    // Upload the file to SharePoint using MS Graph API
    await msGraph.uploadFile(dstFolder, fileName, fileContent, context)
  }

  context.log.info(`AHWR MI Report V3 has been stored ${logUploadIndicator} uploaded`)
}

module.exports = buildAhwrMiReport
