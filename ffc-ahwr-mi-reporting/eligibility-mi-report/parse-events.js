const moment = require('moment')
const groupByPartitionKey = require('../storage/group-by-partition-key')
const { parseData } = require('../parse-data')
const convertFromBoolean = require('../csv/convert-from-boolean')
const formatDate = require('../csv/format-date')
const notApplicableIfUndefined = require('../csv/not-applicable-if-undefined')

const parse = (events) => {
  const sbi = parseData(events, 'auto-eligibility:registration_of_interest', 'sbi')
  const crn = parseData(events, 'auto-eligibility:registration_of_interest', 'crn')
  const businessEmail = parseData(events, 'auto-eligibility:registration_of_interest', 'businessEmail')
  const eligible = parseData(events, 'auto-eligibility:registration_of_interest', 'eligible')
  const registrationOfInterestAt = parseData(events, 'auto-eligibility:registration_of_interest', 'interestRegisteredAt')
  const ineligibleReason = parseData(events, 'auto-eligibility:registration_of_interest', 'ineligibleReason')
  const onWaitingList = parseData(events, 'auto-eligibility:registration_of_interest', 'onWaitingList')

  const sbi2 = parseData(events, 'auto-eligibility:gained_access_to_the_apply_journey', 'sbi')
  const crn2 = parseData(events, 'auto-eligibility:gained_access_to_the_apply_journey', 'crn')
  const businessEmail2 = parseData(events, 'auto-eligibility:gained_access_to_the_apply_journey', 'businessEmail')
  const waitingUpdatedAt = parseData(events, 'auto-eligibility:gained_access_to_the_apply_journey', 'waitingUpdatedAt')
  const accessGranted = parseData(events, 'auto-eligibility:gained_access_to_the_apply_journey', 'accessGranted')
  const accessGrantedAt = parseData(events, 'auto-eligibility:gained_access_to_the_apply_journey', 'accessGrantedAt')

  // it is possible to have the gained_access_to_the_apply_journey event without the registered_their_interest
  // if the registration came before we released. Therefore, to avoid empty data do a comparison between sbi on register your interest
  // and the sbi form apply guidance invite

  return {
    sbi: sbi.value
      ? sbi.value
      : notApplicableIfUndefined(sbi2.value),
    crn: crn.value
      ? crn.value
      : notApplicableIfUndefined(crn2.value),
    businessEmail: businessEmail.value
      ? businessEmail.value
      : notApplicableIfUndefined(businessEmail2.value),
    registrationOfInterestAt: registrationOfInterestAt.value
      ? formatDate(registrationOfInterestAt.value, moment.ISO_8601)
      : notApplicableIfUndefined(formatDate(waitingUpdatedAt.value, moment.ISO_8601)),
    eligible: eligible.value
      ? convertFromBoolean(eligible.value)
      : convertFromBoolean(accessGranted.value),
    ineligibleReason: ineligibleReason.value
      ? ineligibleReason.value
      : notApplicableIfUndefined(undefined),
    onWaitingList: accessGranted.value
      ? convertFromBoolean(false)
      : convertFromBoolean(onWaitingList.value),
    accessGranted: accessGranted.value
      ? convertFromBoolean(accessGranted.value)
      : convertFromBoolean(false),
    accessGrantedAt: notApplicableIfUndefined(formatDate(accessGrantedAt.value, moment.ISO_8601))
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
        registrationOfInterestAt: notApplicableIfUndefined(formatDate(payload.data.interestRegisteredAt, moment.ISO_8601)),
        eligible: convertFromBoolean(payload.data.eligible),
        ineligibleReason: notApplicableIfUndefined(payload.data.ineligibleReason),
        onWaitingList: convertFromBoolean(payload.data.onWaitingList),
        accessGranted: convertFromBoolean(payload.data.accessGranted),
        accessGrantedAt: notApplicableIfUndefined(formatDate(payload.data.accessGrantedAt, moment.ISO_8601))
      }))
    )
  }
  return parsedEvents.sort((a, b) => {
    return moment(b.registrationOfInterestAt, 'DD/MM/YYYY HH:mm').valueOf() - moment(a.registrationOfInterestAt, 'DD/MM/YYYY HH:mm').valueOf()
  })
}

module.exports = parseEvents
