const notifyClient = require('./notify-client')
const createFileName = require('../create-filename')
const { downloadFile } = require('../storage')
const { templateMiReport, miEmailAddress } = require('../config')

const send = async () => {
  if (miEmailAddress) {
    const contents = await downloadFile(createFileName())
    const personalisation = { link_to_file: notifyClient.prepareUpload(contents, true) }
    return notifyClient.sendEmail(
      templateMiReport,
      miEmailAddress,
      { personalisation }
    )
  }
}

module.exports = send
