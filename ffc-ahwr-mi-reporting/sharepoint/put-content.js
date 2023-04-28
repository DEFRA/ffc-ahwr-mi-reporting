const Wreck = require('@hapi/wreck')
const cockatielWreck = require('../cockatiel-wreck')

const graphUrl = {
  sites: 'https://graph.microsoft.com/v1.0/sites'
}

const putContent = async (aadToken, siteId, driveId, pathToFile, fileName, fileContent) => {
  let attempt = 0
  return await cockatielWreck.execute(async () => {
    console.log(`${new Date().toISOString()} sharepoint:putContent: ${JSON.stringify({
      attempt: ++attempt
    })}`)
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
  })
}

module.exports = putContent
