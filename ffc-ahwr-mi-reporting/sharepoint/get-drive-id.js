const Wreck = require('@hapi/wreck')
const config = require('../config/config')
const cockatielWreck = require('../cockatiel-wreck')

const graphUrl = {
  sites: 'https://graph.microsoft.com/v1.0/sites'
}

const getDriveId = async (siteId, accessToken) => {
  let attempt = 0
  return await cockatielWreck.execute(async () => {
    console.log(`${new Date().toISOString()} sharepoint:getDriveId: ${JSON.stringify({
      attempt: ++attempt
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
    const drive = response.payload.value.find(drive => drive.name === config.sharePoint.documentLibrary)
    if (typeof drive === 'undefined') {
      throw new Error(`No drive found: ${JSON.stringify({ name: config.sharePoint.documentLibrary })}`)
    }
    return drive.id
  })
}

module.exports = getDriveId
