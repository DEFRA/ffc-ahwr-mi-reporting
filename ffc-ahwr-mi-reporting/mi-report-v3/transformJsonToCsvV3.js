const { statusToString, statusToId } = require('../utils/statusHelpers')
const {
  arrayToString,
  getReferenceFromNestedData,
  getSbiFromPartitionKey,
  invalidClaimDataToString,
  isInCheckWithSubStatus,
  isInvalidDataEvent,
  parseSheepTestResults,
  replaceCommasWithSpace
} = require('../utils/parse-data')

// Define the CSV column names
const columns = [
  'sbiFromPartitionKey',
  'sessionId',
  'eventType', // type
  'message',
  'reference',
  'applicationReference',
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
  const sbiFromPartitionKey = getSbiFromPartitionKey(partitionKey)
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
    applicationReference,
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
    vetRCVSNumber,
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
    statusId,
    subStatus
  } = data ?? ''
  const { sbi, farmerName, name, email, orgEmail, address, crn, frn } = organisation ?? ''
  const { biosecurity: biosecurityConfirmation, assessmentPercentage } = biosecurity ?? ''
  const relevantReviewForEndemicsReference = getReferenceFromNestedData(relevantReviewForEndemics)
  const latestEndemicsApplicationReference = getReferenceFromNestedData(latestEndemicsApplication)
  const latestVetVisitApplicationReference = getReferenceFromNestedData(latestVetVisitApplication)
  const invalidClaimData = isInvalidDataEvent(type) ? invalidClaimDataToString(data) : ''
  const sheepTestsString = sheepTests ? arrayToString(sheepTests) : ''
  const sheepTestResultsString = sheepTestResults ? parseSheepTestResults(sheepTestResults) : ''
  const isSubStatus = isInCheckWithSubStatus(subStatus, statusId)

  let rowStatusId
  let rowType
  if (isSubStatus) {
    rowStatusId = statusToId(subStatus)
    rowType = type.replace(/.$/, statusToId(subStatus))
  } else {
    rowStatusId = statusId
    rowType = type
  }

  const row = [
    sbiFromPartitionKey,
    sessionId,
    rowType,
    replaceCommasWithSpace(message),
    reference,
    applicationReference,
    tempReference,
    tempClaimReference,
    typeOfReview,
    sbi,
    crn,
    frn,
    replaceCommasWithSpace(farmerName),
    replaceCommasWithSpace(name),
    email,
    orgEmail,
    replaceCommasWithSpace(address),
    replaceCommasWithSpace(raisedBy),
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
    replaceCommasWithSpace(vetName),
    vetRcvs ?? vetRCVSNumber,
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
    latestEndemicsApplicationReference,
    latestVetVisitApplicationReference,
    relevantReviewForEndemicsReference,
    claimed,
    replaceCommasWithSpace(exception),
    replaceCommasWithSpace(invalidClaimData),
    rowStatusId,
    statusToString(rowStatusId ?? 0),
    eventStatus
  ].join(',')

  return row
}

module.exports = transformJsonToCsvV3
