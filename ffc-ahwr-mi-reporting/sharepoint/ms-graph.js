const Wreck = require('@hapi/wreck')
const azureAD = require('./azure-ad')
const getSiteId = require('./get-site-id')
const getDriveId = require('./get-drive-id')

const graphUrl = {
  sites: 'https://graph.microsoft.com/v1.0/sites'
}

const uploadFile = async (pathToFile, fileName, fileContent) => {
  console.log(`${new Date().toISOString()} Uploading file: ${JSON.stringify({
    fileName,
    pathToFile
  })}`)
  try {
    const aadToken = await azureAD.acquireToken()
    const siteId = await getSiteId(aadToken.accessToken)
    const driveId = await getDriveId(siteId, aadToken.accessToken)
    const response = await Wreck.put(
      `${graphUrl.sites}/${siteId}/drives/${driveId}/root:/${encodeURIComponent(pathToFile)}/${encodeURIComponent(fileName.replace(/["*:<>?/|\\]/g, '').trim())}:/content`,
      {
        payload: fileContent,
        headers: {
          Authorization: `Bearer ${aadToken.accessToken}`
        }
      }
    )
    if (response.res.statusCode !== 200 && response.res.statusCode !== 201) {
      throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
    }
  } catch (error) {
    console.log(`${new Date().toISOString()} Error while uploading file: ${error.message}`)
    console.error(error)
    throw error
  }
}

module.exports = {
  uploadFile
}
