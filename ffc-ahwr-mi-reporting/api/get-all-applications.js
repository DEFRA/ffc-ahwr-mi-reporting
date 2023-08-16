const Wreck = require('@hapi/wreck')

async function getAllApplications () {
  try {
    const response = await Wreck.get(
      'http://localhost:3001/api/applications',
      { json: true }
    )
    if (response.res.statusCode !== 200) {
      throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
    }
    return response.payload
  } catch (error) {
    console.error(`${new Date().toISOString()} Getting latest applications failed.`, error)
    throw new Error(`Error retreiving latest applications} - ${error.message}`)
  }
}

module.exports = getAllApplications
