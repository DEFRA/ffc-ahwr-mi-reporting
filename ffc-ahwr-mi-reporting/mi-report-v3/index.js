const config = require('../config/config')
const createFileName = require('../csv/create-csv-filename')
const msGraph = require('../sharepoint/ms-graph')

const { streamBlobToFile, processEntitiesByTimestampPaged, connect } = require('../storage/storage')

const buildAhwrMiReport = async () => {
  const fileName = createFileName('ahwr-mi-report-v3-')
  const dstFolder = `${config.sharePoint.dstFolder}/${config.environment}/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}`

  if (config.featureToggle.sharePoint.enabled) {
    console.log(`${new Date().toISOString()} Creating, storing and uploading AHWR MI Report V3: ${JSON.stringify({
      dstFolder,
      fileName
    })}`)
  } else {
    console.log(`${new Date().toISOString()} Creating, storing but not uploading AHWR MI Report V3: ${JSON.stringify({
      fileName
    })}`)
  }

  console.log(`fileName ${fileName}`)
  console.log(`dstFolder ${dstFolder}`)

  await connect()
  await processEntitiesByTimestampPaged(null, fileName)

  if (config.featureToggle.sharePoint.enabled) {
    // Read the file from the local file system
    const fileContent = await streamBlobToFile(fileName) // Read the file from the local path

    // Upload the file to SharePoint using MS Graph API
    await msGraph.uploadFile(dstFolder, fileName, fileContent)

    console.log(`${new Date().toISOString()} AHWR MI Report V3 has been stored and uploaded: ${JSON.stringify({
      dstFolder,
      fileName
    })}`)
  } else {
    console.log(`${new Date().toISOString()} AHWR MI Report V3 has been stored but not uploaded: ${JSON.stringify({
      fileName
    })}`)
  }
}

module.exports = buildAhwrMiReport
