const { statusToString, statusToId } = require('../utils/statusHelpers')
const {
  arrayToString,
  getReferenceFromNestedData,
  getSbiFromPartitionKey,
  invalidClaimDataToString,
  parseSheepTestResults,
  replaceCommasWithSpace, getVetNameFromPossibleSources, getVetRcvsFromPossibleSources, getVisitDateFromPossibleSources, getTestResultFromPossibleSources, getUrnResultFromPossibleSources, getDateOfTestingFromPossibleSources
} = require('../utils/parse-data')
const config = require('../feature-toggle/config')
const { PIG_GENETIC_SEQUENCING_VALUES } = require('./pig-genetic-sequencing-values')

// Define the CSV column names
const defaultColumns = [
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

const pigUpdatesColumns = [
  'pigsElisaTestResult',
  'pigsPcrTestResult',
  'pigsGeneticSequencing'
]

const pigsAndPaymentsColumns = [
  'typeOfSamplesTaken',
  'numberOfBloodSamples'
]

const buildColumns = () => {
  return [
    ...defaultColumns,
    ...flagColumns,
    ...multiHerdsColumns,
    ...(config.pigUpdates.enabled ? pigUpdatesColumns : []),
    ...(isPigsAndPaymentsEnabled() ? pigsAndPaymentsColumns : [])
  ]
}

const getData = (...args) => {
  return args
}

const getPigUpdatesData = (...args) => {
  if (!config.pigUpdates.enabled) {
    return []
  }

  return args
}

const formatPigsGeneticSequencing = (geneticSequencingResult) => {
  if (!geneticSequencingResult) {
    return ''
  }

  const geneticSequencingLabel = PIG_GENETIC_SEQUENCING_VALUES.find(
    (keyValuePair) => keyValuePair.value === geneticSequencingResult).label

  return geneticSequencingLabel
}

const isPigsAndPaymentsEnabled = () => {
  return new Date() >= new Date(config.pigsAndPaymentsReleaseDate)
}

// Function to transform event data to CSV row format
function transformEventToCsvV3 (event, context) {
  if (!event) {
    context.log.error('No event provided')
    return
  }

  const { partitionKey, SessionId: sessionId, Status: eventStatus, Payload: payload } = event
  const sbiFromPartitionKey = getSbiFromPartitionKey(partitionKey)
  let parsedPayload

  try {
    parsedPayload = JSON.parse(payload)
  } catch (error) {
    context.log.error('Parse event error', event, error)
    return
  }

  const { type, data, raisedBy, raisedOn, message } = parsedPayload
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
    newValue,
    pigsElisaTestResult,
    pigsPcrTestResult,
    pigsGeneticSequencing,
    typeOfSamplesTaken,
    numberOfBloodSamples
  } = data ?? {}
  const { sbi, farmerName, name, email, orgEmail, address, crn, frn } = organisation ?? {}
  const { biosecurity: biosecurityConfirmation, assessmentPercentage } = biosecurity ?? {}
  const relevantReviewForEndemicsReference = getReferenceFromNestedData(relevantReviewForEndemics)
  const latestEndemicsApplicationReference = getReferenceFromNestedData(latestEndemicsApplication)
  const latestVetVisitApplicationReference = getReferenceFromNestedData(latestVetVisitApplication)
  const invalidClaimData = type?.endsWith('-invalid') ? invalidClaimDataToString(data) : ''
  const sheepTestsString = sheepTests ? arrayToString(sheepTests) : ''
  const sheepTestResultsString = parseSheepTestResults(sheepTestResults, updatedProperty, newValue)
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

  const flagData = getData(flagId, flagDetail, flagAppliesToMh, deletedNote)
  const herdData = getData(
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
  const pigUpdatesData = getPigUpdatesData(pigsElisaTestResult, pigsPcrTestResult, formatPigsGeneticSequencing(pigsGeneticSequencing))
  const pigsAndPaymentsData = isPigsAndPaymentsEnabled() ? [typeOfSamplesTaken, numberOfBloodSamples] : []

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
    getDateOfTestingFromPossibleSources(dateOfTesting, updatedProperty, newValue),
    getVetNameFromPossibleSources(vetName, updatedProperty, newValue),
    getVetRcvsFromPossibleSources(vetRcvs, vetRCVSNumber, updatedProperty, newValue),
    getUrnResultFromPossibleSources(urnResult, updatedProperty, newValue),
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
    ...herdData,
    ...pigUpdatesData,
    ...pigsAndPaymentsData
  ].map(item => replaceCommasWithSpace(item)).join(',')
}

module.exports = { transformEventToCsvV3, buildColumns, defaultColumns, flagColumns, multiHerdsColumns, pigUpdatesColumns, pigsAndPaymentsColumns }
