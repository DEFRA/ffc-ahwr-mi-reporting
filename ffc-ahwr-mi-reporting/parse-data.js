const moment = require('moment')

const formatDate = (dateToFormat, currentDateFormat = 'YYYY-MM-DD', dateFormat = 'DD/MM/YYYY HH:mm') => {
  if (dateToFormat) {
    return moment(dateToFormat, currentDateFormat).utc().format(dateFormat)
  }
  return 'Unknown'
}

const parsePayload = (events, eventType) => {
  const eventData = events.filter(event => event.EventType.startsWith(eventType))
  const latestEvent = eventData.sort((a, b) => new Date(b.EventRaised) - new Date(a.EventRaised))[0]
  return latestEvent?.Payload ? JSON.parse(latestEvent?.Payload) : {}
}

const parseData = (events, type, key) => {
  let value = ''
  let raisedOn = ''
  let raisedBy = ''
  const data = parsePayload(events, type)
  try {
    value = data?.data[key]
    raisedOn = formatDate(data?.raisedOn, moment.ISO_8601)
    raisedBy = data?.raisedBy
  } catch (error) {
    // do nothing
  }

  return {
    value,
    raisedOn,
    raisedBy
  }
}

module.exports = {
  formatDate,
  parsePayload,
  parseData
}
