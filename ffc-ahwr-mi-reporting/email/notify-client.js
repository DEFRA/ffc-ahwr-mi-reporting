const { NotifyClient } = require('notifications-node-client')
const { notifyApiKey } = require('../config')

module.exports = new NotifyClient(notifyApiKey)
