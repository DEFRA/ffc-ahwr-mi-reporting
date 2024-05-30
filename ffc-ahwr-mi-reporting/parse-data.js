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
    console.log(`${key} not found`)
  }

  return {
    value,
    raisedOn,
    raisedBy
  }
}

const arrayToString = (array, separator = ' ') => array.join(separator)

const parseSheepTestResults = (sheepTestResults) => {
  const result = []

  const flatten = (item) => {
    if (Array.isArray(item)) {
      item.forEach(subItem => flatten(subItem))
    } else if (typeof item === 'object' && item !== null) {
      if (item.diseaseType) {
        result.push(item.diseaseType)
      }
      if (item.result) {
        if (Array.isArray(item.result)) {
          flatten(item.result)
        } else {
          result.push(`result ${item.result}`)
        }
      }
      if (item.testResult) {
        result.push(`result ${item.testResult}`)
      }
    }
  }

  flatten(sheepTestResults)
  return result.join('  ')
}

module.exports = {
  formatDate,
  parsePayload,
  parseData,
  arrayToString,
  parseSheepTestResults
}
