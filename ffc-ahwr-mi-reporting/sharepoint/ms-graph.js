const Wreck = require('@hapi/wreck')
const config = require('../config/config')
const azureAD = require('./azure-ad')

const graphUrl = {
  sites: 'https://graph.microsoft.com/v1.0/sites'
}

const getSiteId = async (accessToken) => {
  console.log(`${new Date().toISOString()} Getting the site ID: ${JSON.stringify({
    accessToken: `${accessToken.slice(0, 5)}...${accessToken.slice(-5)}`
  })}`)
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

const getDriveId = async (siteId, accessToken) => {
  console.log(`${new Date().toISOString()} Getting the drive ID: ${JSON.stringify({
    siteId: `${siteId.slice(0, 5)}...${siteId.slice(-5)}`,
    accessToken: `${accessToken.slice(0, 5)}...${accessToken.slice(-5)}`
  })}`)
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
  return response.payload.value.find(drive => drive.name === config.sharePoint.documentLibrary).id
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
