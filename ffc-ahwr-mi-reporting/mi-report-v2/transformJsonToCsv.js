const agreementStatusIdToString = require('../mi-report/agreement-status-id-to-string')
const formatDate = require('./format-date')

// Define the CSV column names
const columns = ['sbiFromPartitionKey', 'type', 'message', 'reference', 'tempReference', 'sbiFromPayload', 'farmerName', 'organisationName', 'email', 'address', 'raisedBy', 'raisedOn',
  'journey', 'confirmCheckDetails', 'eligibleSpecies', 'declaration', 'whichReview', 'detailsCorrect', 'visitDate', 'dateOfTesting',
  'vetName', 'vetRcvs', 'urnResult', 'animalsTested', 'claimed', 'statusId', 'statusName', 'eventStatus']

const transformJsonToCsv = (events) => {
  if (events.length === 0) {
    return
  }
  const headerRow = columns.join(',') + '\n'
  const csvContent = events.map(event => {
    return transformEventToCsv(event)
  }).join('\n')

  return headerRow.concat(csvContent)
}

function transformEventToCsv (event) {
  const { partitionKey: sbiFromPartitionKey, Status: eventStatus } = event
  const { type, data, raisedBy, raisedOn, message } = JSON.parse(event.Payload) ?? ''
  const {
    reference,
    tempReference,
    organisation,
    journey,
    confirmCheckDetails,
    eligibleSpecies,
    declaration,
    whichReview,
    detailsCorrect,
    visitDate,
    dateOfTesting,
    vetName,
    vetRcvs,
    urnResult,
    animalsTested,
    claimed,
    statusId
  } = data ?? ''
  const { sbi, farmerName, name, email, address } = organisation ?? ''

  const row = [
    sbiFromPartitionKey,
    type,
    message,
    reference,
    tempReference,
    sbi,
    farmerName,
    name ? name.replace(/,/g, '  ') : '',
    email,
    address ? address.replace(/,/g, '  ') : '',
    raisedBy,
    formatDate(raisedOn),
    journey,
    confirmCheckDetails,
    eligibleSpecies,
    declaration,
    whichReview,
    detailsCorrect,
    formatDate(visitDate),
    formatDate(dateOfTesting),
    vetName,
    vetRcvs,
    urnResult,
    animalsTested,
    claimed,
    statusId,
    agreementStatusIdToString(data.statusId ?? 0),
    eventStatus
  ].join(',')

  return row
}

module.exports = transformJsonToCsv
