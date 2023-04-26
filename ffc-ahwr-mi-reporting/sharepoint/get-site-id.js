const Wreck = require('@hapi/wreck')
const config = require('../config/config')
const cockatiel = require('../cockatiel')

const graphUrl = {
  sites: 'https://graph.microsoft.com/v1.0/sites'
}

const getSiteId = async (accessToken) => {
  console.log(`${new Date().toISOString()} Getting the site ID: ${JSON.stringify({
      accessToken: `${accessToken.slice(0, 5)}...${accessToken.slice(-5)}`
    })}`)
  return await cockatiel.execute(async () => {
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
