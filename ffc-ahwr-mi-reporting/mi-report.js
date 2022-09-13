const moment = require('moment')
const { writeFile } = require('./storage')

const formatDate = (dateToFormat, currentDateFormat = 'YYYY-MM-DD') => {
  if (dateToFormat) {
    return moment(dateToFormat, currentDateFormat).format('DD/MM/YYYY HH:mm')
  }
  return 'Unknown'
}

const groupByPartitionKey = (events) => {
  return events.reduce((group, event) => {
    const { partitionKey } = event
    group[partitionKey] = group[partitionKey] ?? []
    group[partitionKey].push(event)
    return group
  }, {})
}

const parsePayload = (events, eventType) => {
  const eventData = events.filter(event => event.EventType === eventType)
  const latestEvent = eventData.sort((a, b) => new Date(b.EventRaised) - new Date(a.EventRaised))[0]
  return latestEvent?.Payload ? JSON.parse(latestEvent?.Payload) : {}
}

const parseData = (events, type, key) => {
  let value = ''
  let raisedOn = ''
  const data = parsePayload(events, type)

  try {
    value = data?.data[key]
    raisedOn = formatDate(data?.raisedOn, moment.ISO_8601)
  } catch (error) {
    console.log(`${key} not found`)
  }

  return {
    value,
    raisedOn
  }
}

const convertToCSV = (data) => {
  let csv = ''
  csv = data.map(row => Object.values(row))
  csv.unshift(Object.keys(data[0]))
  return `"${csv.join('"\n"').replace(/,/g, '","')}"`
}

const parseCsvData = (events) => {
  const organisationData = parsePayload(events, 'farmerApplyData-organisation')
  const organisation = organisationData?.data?.organisation

  const whichReview = parseData(events, 'farmerApplyData-whichReview', 'whichReview')
  const eligibleSpecies = parseData(events, 'farmerApplyData-eligibleSpecies', 'eligibleSpecies')
  const confirmCheckDetails = parseData(events, 'farmerApplyData-confirmCheckDetails', 'confirmCheckDetails')

  return {
    sbi: organisation?.sbi,
    cph: organisation?.cph,
    name: organisation?.name,
    farmer: organisation?.farmerName,
    address: organisation?.address.replace(/,/g, '","'),
    email: organisation?.email,
    whichReview: whichReview?.value,
    eligibleSpecies: eligibleSpecies?.value,
    confirmCheckDetails: confirmCheckDetails?.value
  }
}

const saveCsv = (miParsedData) => {
  if (miParsedData) {
    const csvData = convertToCSV(miParsedData)
    writeFile('document.csv', csvData)
    console.log('CSV saved')
  } else {
    console.log('No data to create CSV')
  }
}

const buildMiReport = (events) => {
  const miParsedData = []
  const eventByPartitionKey = groupByPartitionKey(events)
  for (const eventGroup in eventByPartitionKey) {
    const eventData = eventByPartitionKey[eventGroup]
    miParsedData.push(parseCsvData(eventData))
  }
  saveCsv(miParsedData)
}

module.exports = buildMiReport
