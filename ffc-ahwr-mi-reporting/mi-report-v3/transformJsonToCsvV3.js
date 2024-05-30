const agreementStatusIdToString = require('../mi-report/agreement-status-id-to-string')
const { arrayToString, parseSheepTestResults } = require('../parse-data')

const isInvalidDataEvent = (eventType) => eventType?.endsWith('-invalid')

const invalidClaimDataToString = (invalidDataEventData) => {
  const { sbi: sbiFromInvalidData, crn: crnFromInvalidData, sessionKey, exception: exceptionFromInvalidData, reference: referenceFromInvalidData } = invalidDataEventData
  // May not need to repeat some of these values, but better to include now then remove them later
  const invalidInfo = `sbi:${sbiFromInvalidData} crn:${crnFromInvalidData} sessionKey:${sessionKey} exception:${exceptionFromInvalidData} reference:${referenceFromInvalidData}`
  return invalidInfo
}

// Define the CSV column names
const columns = [
  'sbiFromPartitionKey',
  'sessionId',
  'eventType', // type
  'message',
  'reference',
  'tempApplicationReference',
  'tempClaimReference',
  'typeOfClaim', // typeOfReview
  'sbiFromPayload',
  'crn',
  'frn',
  'farmerName',
  'organisationName',
  'userEmail',
  'orgEmail',
  'address',
  'raisedBy',
  'raisedOn',
  'journey',
  'confirmCheckDetails',
  'eligibleSpecies', // old application journey
  'agreeSameSpecies',
  'agreeSpeciesNumbers',
  'agreeVisitTimings',
  'declaration',
  'offerStatus',
  'species', // whichReview
  'detailsCorrect',
  'typeOfLivestock',
  'visitDate',
  'dateOfSampling',
  'vetName',
  'vetRcvs',
  'urnReference', // urnResult
  'herdVaccinationStatus',
  'numberOfOralFluidSamples',
  'numberOfSamplesTested',
  'numberAnimalsTested',
  'testResults',
  'vetVisitsReviewTestResults',
  'sheepEndemicsPackage',
  'sheepTests',
  'sheepTestResults',
  'piHunt',
  'biosecurity',
  'biosecurityAssessmentPercentage',
  'diseaseStatus',
  'claimPaymentAmount',
  'latestEndemicsApplication',
  'latestVetVisitApplication',
  'relevantReviewForEndemics',
  'claimed',
  'exception',
  'invalidClaimData',
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
    organisation,
    reference,
    tempReference,
    tempClaimReference,
    typeOfReview,
    journey,
    confirmCheckDetails,
    eligibleSpecies, // old journey
    agreeSameSpecies,
    agreeSpeciesNumbers,
    agreeVisitTimings,
    declaration,
    offerStatus,
    whichReview, // old journey
    detailsCorrect,
    typeOfLivestock,
    visitDate,
    dateOfTesting,
    vetName,
    vetRcvs,
    urnResult,
    herdVaccinationStatus,
    numberOfOralFluidSamples,
    numberOfSamplesTested,
    animalsTested,
    testResults,
    vetVisitsReviewTestResults,
    sheepEndemicsPackage,
    sheepTests, // an array of strings representing the test codes
    sheepTestResults, // will be separate rows, each with an array, adding a test-with-results object to the array each time
    piHunt,
    biosecurity,
    diseaseStatus,
    amount,
    latestEndemicsApplication,
    latestVetVisitApplication,
    relevantReviewForEndemics,
    claimed,
    exception,
    statusId
  } = data ?? ''
  const { sbi, farmerName, name, email, orgEmail, address, crn, frn } = organisation ?? ''
  const { biosecurity: biosecurityConfirmation, assessmentPercentage } = biosecurity ?? ''
  const invalidClaimData = isInvalidDataEvent(type) ? invalidClaimDataToString(data) : ''
  const sheepTestsString = sheepTests ? arrayToString(sheepTests) : ''
  const sheepTestResultsString = sheepTestResults ? parseSheepTestResults(sheepTestResults) : ''

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
    crn,
    frn,
    farmerName ? farmerName.replace(/,/g, ' ') : '',
    name ? name.replace(/,/g, ' ') : '',
    email,
    orgEmail,
    address ? address.replace(/,/g, ' ') : '',
    raisedBy ? raisedBy.replace(/,/g, ' ') : '',
    raisedOn,
    journey,
    confirmCheckDetails,
    eligibleSpecies,
    agreeSameSpecies,
    agreeSpeciesNumbers,
    agreeVisitTimings,
    declaration,
    offerStatus,
    whichReview,
    detailsCorrect,
    typeOfLivestock,
    visitDate,
    dateOfTesting,
    vetName ? vetName.replace(/,/g, ' ') : '',
    vetRcvs,
    urnResult,
    herdVaccinationStatus,
    numberOfOralFluidSamples,
    numberOfSamplesTested,
    animalsTested,
    testResults,
    vetVisitsReviewTestResults,
    sheepEndemicsPackage,
    sheepTestsString,
    sheepTestResultsString,
    piHunt,
    biosecurityConfirmation,
    assessmentPercentage,
    diseaseStatus,
    amount,
    latestEndemicsApplication,
    latestVetVisitApplication,
    relevantReviewForEndemics,
    claimed,
    exception,
    invalidClaimData,
    statusId,
    agreementStatusIdToString(statusId ?? 0),
    eventStatus
  ].join(',')

  return row
}

module.exports = transformJsonToCsvV3
