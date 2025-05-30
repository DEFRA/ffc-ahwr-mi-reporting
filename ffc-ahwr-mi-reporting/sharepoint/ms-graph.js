const Wreck = require('@hapi/wreck')
const config = require('../config/config')
const azureAD = require('./azure-ad')

const graphUrl = {
  sites: 'https://graph.microsoft.com/v1.0/sites'
}

const getSiteId = async (accessToken, context) => {
  context.log.info('Getting the site ID')
  const response = await Wreck.get(
      `${graphUrl.sites}/${config.sharePoint.hostname}:/${config.sharePoint.sitePath}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        json: true
      }
  )
  if (response.res.statusCode !== 200) {
    throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
  }
  return response.payload.id
}

const getDriveId = async (siteId, accessToken, context) => {
  context.log.info(`Getting the drive ID: ${siteId.slice(0, 5)}...${siteId.slice(-5)}`)
  const response = await Wreck.get(
      `${graphUrl.sites}/${siteId}/drives`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        json: true
      }
  )
  if (response.res.statusCode !== 200) {
    throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
  }
  const drive = response.payload.value.find(drive => drive.name === config.sharePoint.documentLibrary)
  if (typeof drive === 'undefined') {
    throw new Error(`No drive found: ${JSON.stringify({ name: config.sharePoint.documentLibrary })}`)
  }
  return drive.id
}

const uploadFile = async (pathToFile, fileName, fileContent, context) => {
  context.log.info(`Uploading file: fileName: ${fileName}, pathToFile: ${pathToFile}`)
  try {
    const aadToken = await azureAD.acquireToken()
    const siteId = await getSiteId(aadToken.accessToken, context)
    const driveId = await getDriveId(siteId, aadToken.accessToken, context)
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
    context.log.error(`Error while uploading file: ${error.message}`)
    throw error
  }
}

module.exports = {
  uploadFile
}
