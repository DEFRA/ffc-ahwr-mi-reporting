const Wreck = require('@hapi/wreck')

async function getApplications () {
  const url = `${process.env.APPLICATION_API_URI}/application/get`
  try {
    const response = await Wreck.get(url, { json: true })
    if (response.res.statusCode !== 200) {
      return { applications: [] }
    }
    return response.payload
  } catch (err) {
    console.log(err)
    return null
  }
}

module.exports = {
  getApplications
}
