const agreementStatusIdToString = require('../mi-report/agreement-status-id-to-string')

// Define the CSV column names
const columns = [
  'sbiFromPartitionKey', 
  'sessionId', 
  'type', 
  'message', 
  'reference', 
  'tempApplicationReference',
  'tempClaimReference',
  'typeOfClaim', // typeOfReview
  'sbiFromPayload', 
  'farmerName', 
  'organisationName', 
  'userEmail',
  'orgEmail',
  'address', 
  'raisedBy', 
  'raisedOn',
  'journey', 
  'confirmCheckDetails', 
  'eligibleSpecies', 
  'declaration', 
  'species', // whichReview
  'detailsCorrect', 
  'visitDate', 
  'dateOfTesting',
  'vetName', 
  'vetRcvs', 
  'urnResult', 
  'numberAnimalsTested', 
  'claimed', 
  'statusId', 
  'statusName', 
  'eventStatus'
]

const transformJsonToCsvV3 = (events) => {
  if (events.length === 0) {
    console.error('No events found')
    return
  }
  const headerRow = columns.join(',') + '\n'
  const csvContent = events.map(event => {
    return transformEventToCsvV3(event)
  }).join('\n')

  return headerRow.concat(csvContent)
}

function transformEventToCsvV3 (event) {
  const { partitionKey, SessionId: sessionId, Status: eventStatus } = event
  const sbiFromPartitionKey = partitionKey && partitionKey.length > 9 ? partitionKey.slice(0, 9) : partitionKey
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
    tempClaimReference,
    typeOfReview,
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
  const { sbi, farmerName, name, email, orgEmail, address } = organisation ?? ''

  const row = [
    sbiFromPartitionKey,
    sessionId,
    type,
    message,
    reference,
    tempReference,
    tempClaimReference,
    typeOfReview,
    sbi,
    farmerName ? farmerName.replace(/,/g, '  ') : '',
    name ? name.replace(/,/g, '  ') : '',
    email,
    orgEmail,
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

module.exports = transformJsonToCsvV3
