const { statusToString, statusToId } = require('../utils/statusHelpers')
const {
  arrayToString,
  getReferenceFromNestedData,
  getSbiFromPartitionKey,
  invalidClaimDataToString,
  parseSheepTestResults,
  replaceCommasWithSpace, getVetNameFromPossibleSources, getVetRcvsFromPossibleSources, getVisitDateFromPossibleSources, getTestResultFromPossibleSources
} = require('../utils/parse-data')
const config = require('../feature-toggle/config')

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
  'agreeMultipleSpecies',
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
  'piHuntRecommended',
  'piHuntAllAnimals',
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

const flagColumns = [
  'applicationFlagId',
  'applicationFlagDetail',
  'flagAppliesToMh',
  'applicationFlagRemovedDetail'
]

const multiHerdsColumns = [
  'tempHerdId',
  'herdId',
  'herdVersion',
  'herdName',
  'herdSpecies',
  'herdCph',
  'herdReasonManagementNeeds',
  'herdReasonUniqueHealth',
  'herdReasonDifferentBreed',
  'herdReasonOtherPurpose',
  'herdReasonKeptSeparate',
  'herdReasonOnlyHerd',
  'herdReasonOther'
]

const buildColumns = () => {
  return [
    ...columns,
    ...(config.flagReporting.enabled ? flagColumns : []),
    ...(config.multiHerds.enabled ? multiHerdsColumns : [])
  ]
}

const getFlagData = (...args) => {
  if (!config.flagReporting.enabled) {
    return []
  }

  return args
}

const getHerdData = (...args) => {
  if (!config.multiHerds.enabled) {
    return []
  }

  return args
}

// Function to transform event data to CSV row format
function transformEventToCsvV3 (event, context) {
  if (!event) {
    context.log.error('No event provided')
    return
  }

  const { partitionKey, SessionId: sessionId, Status: eventStatus } = event
  const sbiFromPartitionKey = getSbiFromPartitionKey(partitionKey)
  let parsePayload = ''
  try {
    parsePayload = JSON.parse(event.Payload)
  } catch (error) {
    context.log.error('Parse event error', event, error)
    return
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
    eligibleSpecies,
    agreeSameSpecies,
    agreeMultipleSpecies,
    agreeSpeciesNumbers,
    agreeVisitTimings,
    declaration,
    offerStatus,
    whichReview,
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
    sheepTests,
    sheepTestResults,
    piHunt,
    piHuntRecommended,
    piHuntAllAnimals,
    biosecurity,
    diseaseStatus,
    amount,
    latestEndemicsApplication,
    latestVetVisitApplication,
    relevantReviewForEndemics,
    claimed,
    exception,
    statusId,
    subStatus,
    flagId,
    flagDetail,
    flagAppliesToMh,
    deletedNote,
    tempHerdId,
    herdId,
    herdVersion,
    herdName,
    herdSpecies,
    herdCph,
    herdReasonManagementNeeds,
    herdReasonUniqueHealth,
    herdReasonDifferentBreed,
    herdReasonOtherPurpose,
    herdReasonKeptSeparate,
    herdReasonOnlyHerd,
    herdReasonOther,
    updatedProperty,
    newValue
  } = data ?? {}
  const { sbi, farmerName, name, email, orgEmail, address, crn, frn } = organisation ?? {}
  const { biosecurity: biosecurityConfirmation, assessmentPercentage } = biosecurity ?? {}
  const relevantReviewForEndemicsReference = getReferenceFromNestedData(relevantReviewForEndemics)
  const latestEndemicsApplicationReference = getReferenceFromNestedData(latestEndemicsApplication)
  const latestVetVisitApplicationReference = getReferenceFromNestedData(latestVetVisitApplication)
  const invalidClaimData = type?.endsWith('-invalid') ? invalidClaimDataToString(data) : ''
  const sheepTestsString = sheepTests ? arrayToString(sheepTests) : ''
  const sheepTestResultsString = sheepTestResults ? parseSheepTestResults(sheepTestResults) : ''
  const isSubStatus = subStatus && statusId === 5

  let rowStatusId
  let rowType
  if (isSubStatus) {
    rowStatusId = statusToId(subStatus)
    rowType = type.replace(/.$/, statusToId(subStatus))
  } else {
    rowStatusId = statusId
    rowType = type
  }

  const flagData = getFlagData(flagId, flagDetail, flagAppliesToMh, deletedNote)
  const herdData = getHerdData(
    tempHerdId,
    herdId,
    herdVersion,
    herdName,
    herdSpecies,
    herdCph,
    herdReasonManagementNeeds,
    herdReasonUniqueHealth,
    herdReasonDifferentBreed,
    herdReasonOtherPurpose,
    herdReasonKeptSeparate,
    herdReasonOnlyHerd,
    herdReasonOther)

  return [
    sbiFromPartitionKey,
    sessionId,
    rowType,
    message,
    reference,
    applicationReference,
    tempReference,
    tempClaimReference,
    typeOfReview,
    sbi,
    crn,
    frn,
    farmerName,
    name,
    email,
    orgEmail,
    address,
    raisedBy,
    raisedOn,
    journey,
    confirmCheckDetails,
    eligibleSpecies,
    agreeSameSpecies,
    agreeMultipleSpecies,
    agreeSpeciesNumbers,
    agreeVisitTimings,
    declaration,
    offerStatus,
    whichReview,
    detailsCorrect,
    typeOfLivestock,
    getVisitDateFromPossibleSources(visitDate, updatedProperty, newValue),
    dateOfTesting,
    getVetNameFromPossibleSources(vetName, updatedProperty, newValue),
    getVetRcvsFromPossibleSources(vetRcvs, vetRCVSNumber, updatedProperty, newValue),
    urnResult,
    herdVaccinationStatus,
    numberOfOralFluidSamples,
    numberOfSamplesTested,
    animalsTested,
    getTestResultFromPossibleSources(testResults, updatedProperty, newValue),
    vetVisitsReviewTestResults,
    sheepEndemicsPackage,
    sheepTestsString,
    sheepTestResultsString,
    piHunt,
    piHuntRecommended,
    piHuntAllAnimals,
    biosecurityConfirmation,
    assessmentPercentage,
    diseaseStatus,
    amount,
    latestEndemicsApplicationReference,
    latestVetVisitApplicationReference,
    relevantReviewForEndemicsReference,
    claimed,
    exception,
    invalidClaimData,
    rowStatusId,
    statusToString(rowStatusId ?? 0),
    eventStatus,
    ...flagData,
    ...herdData
  ].map(item => replaceCommasWithSpace(item)).join(',')
}

module.exports = { transformEventToCsvV3, columns: buildColumns() }
