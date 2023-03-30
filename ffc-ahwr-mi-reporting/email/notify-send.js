const notifyClient = require('./notify-client')
const createFileName = require('../csv/create-filename')
const { downloadFile } = require('../storage/storage')
const { templateMiReport, templateEligibilityMiReport, miEmailAddress, environment } = require('../config/config')

const send = async () => {
  // Removed code for not sending email, this function will replace to store file in Sharepoint
}

const sendEligibilityReport = async () => {  
  // Removed code for not sending email, this function will replace to store file in Sharepoint
}

module.exports = {
  send,
  sendEligibilityReport
}
