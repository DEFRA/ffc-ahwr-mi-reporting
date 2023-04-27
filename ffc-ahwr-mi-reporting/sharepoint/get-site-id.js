const Wreck = require('@hapi/wreck')
const config = require('../config/config')
const cockatielWreck = require('../cockatiel-wreck')

const graphUrl = {
  sites: 'https://graph.microsoft.com/v1.0/sites'
}

const getSiteId = async (accessToken) => {
  let attempt = 0
  return await cockatielWreck.execute(async () => {
    console.log(`${new Date().toISOString()} sharepoint:getSiteId: ${JSON.stringify({
      attempt: ++attempt
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
  })
}

module.exports = getSiteId
