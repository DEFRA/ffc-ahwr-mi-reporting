const { NotifyClient } = require('notifications-node-client')
const { notifyApiKey } = require('../config/config')

module.exports = new NotifyClient(notifyApiKey)
