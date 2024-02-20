const moment = require('moment')

const formatDate = (dateToFormat, currentDateFormat = 'YYYY-MM-DD', dateFormat = 'DD/MM/YYYY HH:mm') => {
  return dateToFormat ? moment(dateToFormat, currentDateFormat).utc().format(dateFormat) : null
}

module.exports = formatDate
