const config = require('../config/config')
const createFileName = require('../csv/create-csv-filename')
const msGraph = require('../sharepoint/ms-graph')
const { streamJsonToCsv, uploadFileToAzureBlob } = require('../mi-report-v3/transformJsonToCsvV3')
const { connectionString, containerName } = require('../config/config')
const os = require('os')
const path = require('path')
const fs = require('fs')

const buildAhwrMiReportV3 = async (events) => {
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

  // Generate the CSV file for the MI report
  // Create a temporary file
  const tempDir = os.tmpdir() // Get the system temp directory
  const csvFilePath = path.join(tempDir, `tempfile_${Date.now()}.csv`) // Define the local path for the CSV file
  await streamJsonToCsv(events, csvFilePath)

  // Step 5: Upload the CSV file to Azure Blob Storage
  await uploadFileToAzureBlob(csvFilePath, containerName, fileName, connectionString)

  console.log(`MI report generated and uploaded as ${fileName}`)

  if (config.featureToggle.sharePoint.enabled) {
    // Read the file from the local file system
    const fileContent = fs.readFileSync(csvFilePath) // Read the file from the local path

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
  // After successful upload, delete the temporary file
  fs.unlinkSync(csvFilePath) // Delete the temporary file
  console.log(`Temporary file deleted: ${csvFilePath}`)
}

module.exports = buildAhwrMiReportV3
