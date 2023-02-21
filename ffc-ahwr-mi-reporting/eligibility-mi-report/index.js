const groupByPartitionKey = require('../group-by-partition-key')
const parseData = require('../parse-data')
const convertToCSV = require('../convert-to-csv')
const createFileName = require('../create-filename')
const { writeFile } = require('../storage')
const { sendEligibilityReport } = require('../email/notify-send')

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

const buildEligibilityMiReport = async (events) => {
  const miParsedData = []
  const eventByPartitionKey = groupByPartitionKey(events)
  for (const eventGroup in eventByPartitionKey) {
    const eventData = eventByPartitionKey[eventGroup]
    const filteredEvents = eventData.filter(event => event.EventType === 'registration_of_interest' || event.EventType === 'gained_access_to_the_apply_journey')
    if (filteredEvents.length !== 0) {
      miParsedData.push(parseEligibilityCsvData(filteredEvents))
    }
  }
  await saveEligibilityCsv(miParsedData)
}

module.exports = buildEligibilityMiReport
