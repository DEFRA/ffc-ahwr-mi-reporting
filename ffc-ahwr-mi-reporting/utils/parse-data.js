const moment = require('moment')

const arrayToString = (array, separator = ' ') => {
  if (Array.isArray(array)) {
    return array.join(separator)
  } else {
    return array
  }
}

const formatDate = (dateToFormat, currentDateFormat = 'YYYY-MM-DD', dateFormat = 'DD/MM/YYYY HH:mm') => {
  if (dateToFormat) {
    return moment(dateToFormat, currentDateFormat).utc().format(dateFormat)
  }
  return 'Unknown'
}

const getReferenceFromNestedData = (data) => {
  return data ? data.reference : ''
}

const getSbiFromPartitionKey = (partitionKey) => partitionKey?.length > 9 ? partitionKey.slice(0, 9) : partitionKey

const invalidClaimDataToString = (invalidDataEventData) => {
  const { sbi: sbiFromInvalidData, crn: crnFromInvalidData, sessionKey, exception: exceptionFromInvalidData, reference: referenceFromInvalidData } = invalidDataEventData
  // May not need to repeat some of these values, but better to include now then remove them later
  return `sbi:${sbiFromInvalidData} crn:${crnFromInvalidData} sessionKey:${sessionKey} exception:${exceptionFromInvalidData} reference:${referenceFromInvalidData}`
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

const parsePayload = (events, eventType) => {
  const eventData = events.filter(event => event.EventType.startsWith(eventType))
  const latestEvent = eventData.sort((a, b) => new Date(b.EventRaised) - new Date(a.EventRaised))[0]
  return latestEvent?.Payload ? JSON.parse(latestEvent?.Payload) : {}
}

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

const replaceCommasWithSpace = (stringToEdit) => {
  return stringToEdit ? stringToEdit.replace(/,/g, ' ') : ''
}

module.exports = {
  arrayToString,
  formatDate,
  getReferenceFromNestedData,
  getSbiFromPartitionKey,
  invalidClaimDataToString,
  parseData,
  parsePayload,
  parseSheepTestResults,
  replaceCommasWithSpace
}
