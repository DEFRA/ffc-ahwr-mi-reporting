const notifyClient = require('./notify-client')
const createFileName = require('../create-filename')
const { downloadFile } = require('../storage')
const { templateMiReport, templateEligibilityMiReport, miEmailAddress, environment } = require('../config')

const send = async () => {
  if (miEmailAddress) {
    const contents = await downloadFile(createFileName('ahwr-mi-report.csv'))
    const personalisation = { environment, link_to_file: notifyClient.prepareUpload(contents, true) }
    console.log(`Sending MI report to email ${miEmailAddress} for environment ${environment}`)
    return notifyClient.sendEmail(
      templateMiReport,
      miEmailAddress,
      { personalisation }
    )
  }
}

const sendEligibilityReport = async () => {
  if (miEmailAddress) {
    const contents = await downloadFile(createFileName('ahwr-eligibility-mi-report.csv'))
    const personalisation = { environment, link_to_file: notifyClient.prepareUpload(contents, true) }
    console.log(`Sending Eligibility MI report to email ${miEmailAddress} for environment ${environment}`)
    return notifyClient.sendEmail(
      templateEligibilityMiReport,
      miEmailAddress,
      { personalisation }
    )
  }
}

module.exports = {
  send,
  sendEligibilityReport
}
