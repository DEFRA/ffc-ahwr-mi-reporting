const agreementStatusIdToString = require('../mi-report/agreement-status-id-to-string')

// Define the CSV column names
const columns = ['sbiFromPartitionKey', 'sessionId', 'type', 'message', 'reference', 'tempReference', 'sbiFromPayload', 'farmerName', 'organisationName', 'email', 'address', 'raisedBy', 'raisedOn',
  'journey', 'confirmCheckDetails', 'eligibleSpecies', 'declaration', 'whichReview', 'detailsCorrect', 'visitDate', 'dateOfTesting',
  'vetName', 'vetRcvs', 'urnResult', 'animalsTested', 'claimed', 'statusId', 'statusName', 'eventStatus']

const transformJsonToCsv = (events) => {
  if (events.length === 0) {
    console.error('No events found')
    return
  }
  const headerRow = columns.join(',') + '\n'
  const csvContent = events.map(event => {
    return transformEventToCsv(event)
  }).join('\n')

  return headerRow.concat(csvContent)
}

function transformEventToCsv (event) {
  const { partitionKey: sbiFromPartitionKey, SessionId: sessionId, Status: eventStatus } = event

  let parsePayload = ''
  try {
    parsePayload = JSON.parse(event.Payload)
  } catch (error) {
    console.error('Parse event error', event, error)
  }

  const { type, data, raisedBy, raisedOn, message } = parsePayload
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
    sessionId,
    type,
    message,
    reference,
    tempReference,
    sbi,
    farmerName ? farmerName.replace(/,/g, '  ') : '',
    name ? name.replace(/,/g, '  ') : '',
    email,
    address ? address.replace(/,/g, '  ') : '',
    raisedBy ? raisedBy.replace(/,/g, '  ') : '',
    raisedOn,
    journey,
    confirmCheckDetails,
    eligibleSpecies,
    declaration,
    whichReview,
    detailsCorrect,
    visitDate,
    dateOfTesting,
    vetName ? vetName.replace(/,/g, '  ') : '',
    vetRcvs,
    urnResult,
    animalsTested,
    claimed,
    statusId,
    agreementStatusIdToString(statusId ?? 0),
    eventStatus
  ].join(',')

  return row
}

module.exports = transformJsonToCsv
