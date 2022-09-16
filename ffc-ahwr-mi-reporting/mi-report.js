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

const calculateJourneyTime = (events) => {
  const sortEvents = events.sort((a, b) => new Date(a.EventRaised) - new Date(b.EventRaised))
  const firstEvent = sortEvents[0].EventRaised
  const lastEvent = sortEvents[sortEvents.length - 1].EventRaised
  let timeDelta = Math.abs(new Date(firstEvent) - new Date(lastEvent)) / 1000
  const days = Math.floor(timeDelta / 86400)
  timeDelta -= days * 86400
  const hours = Math.floor(timeDelta / 3600) % 24
  timeDelta -= hours * 3600
  const minutes = Math.floor(timeDelta / 60) % 60
  timeDelta -= minutes * 60
  const seconds = timeDelta % 60
  return [
    { text: 'Apply journey time\n\n', style: 'subheader' },
    `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`
  ]
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
  const agreementReference = parseData(events, 'farmerApplyData-reference', 'reference')

  const claimDetailsCorrect = parseData(events, 'claim-detailsCorrect', 'detailsCorrect')
  const claimVisitDate = parseData(events, 'claim-visitDate', 'visitDate')
  const claimVetName = parseData(events, 'claim-vetName', 'vetName')
  const claimVetRcvs = parseData(events, 'claim-vetRcvs', 'vetRcvs')
  const claimClaimed = parseData(events, 'claim-claimed', 'claimed')

  return {
    sbi: organisation?.sbi,
    cph: organisation?.cph,
    name: organisation?.name,
    farmer: organisation?.farmerName,
    address: organisation?.address.replace(/,/g, '","'),
    email: organisation?.email,
    whichReview: whichReview?.value,
    whichReviewRaisedOn: whichReview?.raisedOn,
    eligibleSpecies: eligibleSpecies?.value,
    eligibleSpeciesRaisedOn: eligibleSpecies?.raisedOn,
    confirmCheckDetails: confirmCheckDetails?.value,
    confirmCheckDetailsRaisedOn: confirmCheckDetails?.raisedOn,
    confirmAgreementReview: agreementReference?.value ? 'yes' : '',
    confirmAgreementReviewRaisedOn: agreementReference?.value ? agreementReference?.raisedOn : '',
    applicationNumber: agreementReference?.value,
    claimDetailsCorrect: claimDetailsCorrect?.value,
    claimDetailsCorrectRaisedOn: claimDetailsCorrect?.raisedOn,
    claimVisitDate: claimVisitDate?.value,
    claimVisitDateRaisedOn: claimVisitDate?.raisedOn,
    claimVetName: claimVetName?.value,
    claimVetNameRaisedOn: claimVetName?.raisedOn,
    claimVetRcvs: claimVetRcvs?.value,
    claimVetRcvsRaisedOn: claimVetRcvs?.raisedOn,
    claimClaimed: claimClaimed?.value,
    claimClaimedRaisedOn: claimClaimed?.raisedOn
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
