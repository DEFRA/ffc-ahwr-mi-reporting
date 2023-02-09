const notifyClient = require('./notify-client')
const createFileName = require('../create-filename')
const { downloadFile } = require('../storage')
const { templateMiReport, miEmailAddress, environment } = require('../config')

const send = async () => {
  if (miEmailAddress) {
    const contents = await downloadFile(createFileName())
    const personalisation = { environment, link_to_file: notifyClient.prepareUpload(contents, true) }
    console.log(`Sending MI report to email ${miEmailAddress} for environment ${environment}`)
    return notifyClient.sendEmail(
      templateMiReport,
      miEmailAddress,
      { personalisation }
    )
  }
}

module.exports = send
