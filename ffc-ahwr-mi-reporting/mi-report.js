const moment = require('moment')
const { writeFile } = require('./storage')
const createFileName = require('./create-filename')
const { send, sendEligibilityReport } = require('./email/notify-send')
const groupByPartitionKey = require('./group-by-partition-key')

const formatDate = (dateToFormat, currentDateFormat = 'YYYY-MM-DD', dateFormat = 'DD/MM/YYYY HH:mm') => {
  if (dateToFormat) {
    return moment(dateToFormat, currentDateFormat).format(dateFormat)
  }
  return 'Unknown'
}

const convertFromBoolean = (value) => {
  if (value) {
    return value === true ? 'yes' : 'no'
  }

  return ''
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
  const agreementReference = parseData(events, 'farmerApplyData-reference', 'reference')
  const agreementDeclaration = parseData(events, 'farmerApplyData-declaration', 'declaration')

  const claimDetailsCorrect = parseData(events, 'claim-detailsCorrect', 'detailsCorrect')
  const claimVisitDate = parseData(events, 'claim-visitDate', 'visitDate')
  const claimVetName = parseData(events, 'claim-vetName', 'vetName')
  const claimVetRcvs = parseData(events, 'claim-vetRcvs', 'vetRcvs')
  const claimUrnResult = parseData(events, 'claim-urnResult', 'urnResult')
  const claimClaimed = parseData(events, 'claim-claimed', 'claimed')

  return {
    sbi: organisation?.sbi,
    cph: organisation?.cph,
    name: organisation?.name.replace(/,/g, '","'),
    farmer: organisation?.farmerName,
    address: organisation?.address.replace(/,/g, '","'),
    email: organisation?.email,
    whichReview: whichReview?.value,
    whichReviewRaisedOn: whichReview?.raisedOn,
    eligibleSpecies: eligibleSpecies?.value,
    eligibleSpeciesRaisedOn: eligibleSpecies?.raisedOn,
    confirmCheckDetails: confirmCheckDetails?.value,
    confirmCheckDetailsRaisedOn: confirmCheckDetails?.raisedOn,
    declaration: convertFromBoolean(agreementDeclaration?.value),
    declarationRaisedOn: agreementDeclaration?.raisedOn,
    applicationNumber: agreementReference?.value,
    claimDetailsCorrect: claimDetailsCorrect?.value,
    claimDetailsCorrectRaisedOn: claimDetailsCorrect?.raisedOn,
    claimVisitDate: formatDate(claimVisitDate?.value, moment.ISO_8601, 'DD/MM/YYYY'),
    claimVisitDateRaisedOn: claimVisitDate?.raisedOn,
    claimVetName: claimVetName?.value,
    claimVetNameRaisedOn: claimVetName?.raisedOn,
    claimVetRcvs: claimVetRcvs?.value,
    claimVetRcvsRaisedOn: claimVetRcvs?.raisedOn,
    claimUrnResult: claimUrnResult?.value.toString(),
    claimUrnResultRaisedOn: claimUrnResult?.raisedOn,
    claimClaimed: claimClaimed?.value,
    claimClaimedRaisedOn: claimClaimed?.raisedOn
  }
}

const parseEligibilityCsvData = (events) => {
  const sbi = parseData(events, 'registration_of_interest', 'sbi')
  const crn = parseData(events, 'registration_of_interest', 'crn')
  const businessEmail = parseData(events, 'registration_of_interest', 'businessEmail')
  const eligible = parseData(events, 'registration_of_interest', 'eligible')
  const registrationOfInterestTimestamp = parseData(events, 'registration_of_interest', 'interestRegisteredAt')
  const ineligibleReason = parseData(events, 'registration_of_interest', 'ineligibleReason')
  const onWaitingList = parseData(events, 'registration_of_interest', 'onWaitingList')

  const accessGranted = parseData(events, 'gained_access_to_the_apply_journey', 'accessGranted')
  const accessGrantedTimestamp = parseData(events, 'gained_access_to_the_apply_journey', 'accessGrantedAt')
  const sbi2 = parseData(events, 'gained_access_to_the_apply_journey', 'sbi')
  const crn2 = parseData(events, 'gained_access_to_the_apply_journey', 'crn')
  const email2 = parseData(events, 'gained_access_to_the_apply_journey', 'businessEmail')
  const waitingListUpdated = parseData(events, 'gained_access_to_the_apply_journey', 'waitingUpdatedAt')

  // it is possible to have the gained_access_to_the_apply_journey event without the registered_their_interest
  // if the registration came before we released. Therefore, to avoid empty data do a comparison between sbi on register your interest
  // and the sbi form apply guidance invite 


  return {
    sbi: sbi.value ? sbi.value : sbi2 ? sbi2.value : 'n/a',
    crn: crn.value ? crn.value : crn2 ? crn2.value : 'n/a',
    businessEmail: businessEmail.value ? businessEmail.value : email2 ? email2.value : 'n/a',
    eligible: eligible.value ? eligible.value : accessGranted.value ? accessGranted.value : 'FALSE',
    registrationOfInterestTimestamp: registrationOfInterestTimestamp.value ? registrationOfInterestTimestamp.value : waitingListUpdated.value ? waitingListUpdated.value : 'n/a',
    ineligibleReason: ineligibleReason.value ? ineligibleReason.value : 'n/a',
    onWaitingList: accessGranted.value ? 'FALSE' : onWaitingList.value ? onWaitingList.value : 'FALSE',
    accessGranted: accessGranted.value ? accessGranted.value : 'FALSE',
    accessGrantedTimestamp: accessGrantedTimestamp.value ? accessGrantedTimestamp.value : 'n/a'
  }
}

const saveCsv = async (miParsedData) => {
  if (miParsedData) {
    const csvData = convertToCSV(miParsedData)
    await writeFile(createFileName('ahwr-mi-report.csv'), csvData)
    await send()
    console.log('CSV saved')
  } else {
    console.log('No data to create CSV')
  }
}

const saveEligibilityCsv = async (miParsedData) => {
  if (miParsedData) {
    const csvData = convertToCSV(miParsedData)
    await writeFile(createFileName('ahwr-eligibility-mi-report.csv'), csvData)
    await sendEligibilityReport()
    console.log('CSV saved')
  } else {
    console.log('No data to create CSV')
  }
}

const buildMiReport = async (events) => {
  const miParsedData = []
  const eventByPartitionKey = groupByPartitionKey(events)
  for (const eventGroup in eventByPartitionKey) {
    const eventData = eventByPartitionKey[eventGroup]
    miParsedData.push(parseCsvData(eventData))
  }
  await saveCsv(miParsedData)
}

const buildEligibilityMiReport = async (events) => {
  const miParsedData = []
  const eventByPartitionKey = groupByPartitionKey(events)
  for (const eventGroup in eventByPartitionKey) {
    const eventData = eventByPartitionKey[eventGroup]
    const filteredEvents = eventData.filter(event => event.EventType === 'registration_of_interest' || event.EventType === 'gained_access_to_the_apply_journey')  
    if (filteredEvents.length != 0) {
      miParsedData.push(parseEligibilityCsvData(eventData))
    }
  }
  await saveEligibilityCsv(miParsedData)
}

module.exports = {
  buildMiReport,
  buildEligibilityMiReport
}
