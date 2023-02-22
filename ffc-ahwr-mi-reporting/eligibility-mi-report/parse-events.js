const groupByPartitionKey = require('../group-by-partition-key')
const { parseData } = require('../parse-data')
const convertFromBoolean = require('../convert-from-boolean')

const parse = (events) => {
  const sbi = parseData(events, 'auto-eligibility:registration_of_interest', 'sbi')
  const crn = parseData(events, 'auto-eligibility:registration_of_interest', 'crn')
  const businessEmail = parseData(events, 'auto-eligibility:registration_of_interest', 'businessEmail')
  const eligible = parseData(events, 'auto-eligibility:registration_of_interest', 'eligible')
  const registrationOfInterestTimestamp = parseData(events, 'auto-eligibility:registration_of_interest', 'interestRegisteredAt')
  const ineligibleReason = parseData(events, 'auto-eligibility:registration_of_interest', 'ineligibleReason')
  const onWaitingList = parseData(events, 'auto-eligibility:registration_of_interest', 'onWaitingList')

  const accessGranted = parseData(events, 'auto-eligibility:gained_access_to_the_apply_journey', 'accessGranted')
  const accessGrantedTimestamp = parseData(events, 'auto-eligibility:gained_access_to_the_apply_journey', 'accessGrantedAt')
  const sbi2 = parseData(events, 'auto-eligibility:gained_access_to_the_apply_journey', 'sbi')
  const crn2 = parseData(events, 'auto-eligibility:gained_access_to_the_apply_journey', 'crn')
  const email2 = parseData(events, 'auto-eligibility:gained_access_to_the_apply_journey', 'businessEmail')
  const waitingListUpdated = parseData(events, 'auto-eligibility:gained_access_to_the_apply_journey', 'waitingUpdatedAt')

  // it is possible to have the gained_access_to_the_apply_journey event without the registered_their_interest
  // if the registration came before we released. Therefore, to avoid empty data do a comparison between sbi on register your interest
  // and the sbi form apply guidance invite

  return {
    sbi: sbi.value ? sbi.value : sbi2 ? sbi2.value : 'n/a',
    crn: crn.value ? crn.value : crn2 ? crn2.value : 'n/a',
    businessEmail: businessEmail.value ? businessEmail.value : email2 ? email2.value : 'n/a',
    registrationOfInterestTimestamp: registrationOfInterestTimestamp.value ? registrationOfInterestTimestamp.value : waitingListUpdated.value ? waitingListUpdated.value : 'n/a',
    eligible: eligible.value ? convertFromBoolean(eligible.value) : convertFromBoolean(accessGranted.value),
    ineligibleReason: ineligibleReason.value ? ineligibleReason.value : 'n/a',
    onWaitingList: accessGranted.value ? convertFromBoolean(false) : convertFromBoolean(onWaitingList.value),
    accessGranted: accessGranted.value ? convertFromBoolean(accessGranted.value) : convertFromBoolean(false),
    accessGrantedTimestamp: accessGrantedTimestamp.value ? accessGrantedTimestamp.value : 'n/a'
  }
}

const parseEvents = (events) => {
  const parsedEvents = []
  const eventByPartitionKey = groupByPartitionKey(events)
  for (const eventGroup in eventByPartitionKey) {
    const eventData = eventByPartitionKey[eventGroup]
    const filteredEvents = eventData.filter(event => event.EventType === 'auto-eligibility:registration_of_interest' || event.EventType === 'auto-eligibility:gained_access_to_the_apply_journey')
    if (filteredEvents.length !== 0) {
      parsedEvents.push(parse(filteredEvents))
    }
    parsedEvents.push(...eventData
      .filter(event => event.EventType === 'auto-eligibility:duplicate_submission' || event.EventType === 'auto-eligibility:no_match')
      .map(event => JSON.parse(event.Payload))
      .map(payload => ({
        sbi: payload.data.sbi,
        crn: payload.data.crn,
        businessEmail: payload.data.businessEmail,
        registrationOfInterestTimestamp: payload.data.interestRegisteredAt,
        eligible: convertFromBoolean(payload.data.eligible),
        ineligibleReason: payload.data.ineligibleReason,
        onWaitingList: convertFromBoolean(payload.data.onWaitingList),
        accessGranted: convertFromBoolean(payload.data.accessGranted),
        accessGrantedTimestamp: payload.data.accessGrantedTimestamp ? payload.data.accessGrantedTimestamp : 'n/a'
      }))
    )
  }
  return parsedEvents
}

module.exports = parseEvents
