const azureAD = require('./azure-ad')
const getSiteId = require('./get-site-id')
const getDriveId = require('./get-drive-id')
const putContent = require('./put-content')

const uploadFile = async (pathToFile, fileName, fileContent) => {
  console.log(`${new Date().toISOString()} Uploading file: ${JSON.stringify({
    fileName,
    pathToFile
  })}`)
  try {
    const aadToken = await azureAD.acquireToken()
    const siteId = await getSiteId(aadToken.accessToken)
    const driveId = await getDriveId(siteId, aadToken.accessToken)
    await putContent(aadToken, siteId, driveId, pathToFile, fileName, fileContent)
  } catch (error) {
    console.log(`${new Date().toISOString()} Error while uploading file: ${error.message}`)
    console.error(error)
    throw error
  }
}

module.exports = {
  uploadFile
}
