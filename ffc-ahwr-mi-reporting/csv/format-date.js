const moment = require('moment')

const formatDate = (dateToFormat, currentDateFormat = 'YYYY-MM-DD', dateFormat = 'DD/MM/YYYY HH:mm') => {
  if (typeof dateToFormat === 'undefined') {
    return undefined
  }
  if (dateToFormat === 'n/a' || dateToFormat === '') {
    return undefined
  }
  return moment(dateToFormat, currentDateFormat).utc().format(dateFormat)
}

module.exports = formatDate
