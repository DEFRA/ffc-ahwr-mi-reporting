const moment = require('moment')
const groupByPartitionKey = require('../storage/group-by-partition-key')
const notApplicableIfUndefined = require('../csv/not-applicable-if-undefined')
const convertFromBoolean = require('../csv/convert-from-boolean')
const formatDate = require('../csv/format-date')

const createRows = (events) => {
  const rows = []
  const groupedByPartitionKey = groupByPartitionKey(events)
  for (const businessEmail in groupedByPartitionKey) {
    const registrationOfInterest = JSON.parse(groupedByPartitionKey[businessEmail].find(
      event => event.EventType.startsWith('registration_of_interest')
    )?.Payload ?? '{}')
    const gainedAccessToTheApplyJourney = JSON.parse(groupedByPartitionKey[businessEmail].find(
      event => event.EventType.startsWith('gained_access_to_the_apply_journey')
    )?.Payload ?? '{}')
    rows.push({
      businessEmail: notApplicableIfUndefined(businessEmail),
      interestRegisteredAt: notApplicableIfUndefined(
        formatDate(registrationOfInterest?.createdAt
          ? registrationOfInterest?.createdAt
          : gainedAccessToTheApplyJourney?.accessGrantedAt,
        moment.ISO_8601)
      ),
      eligibility: convertFromBoolean(true),
      ineligibleReason: notApplicableIfUndefined(undefined),
      accessGranted: convertFromBoolean(gainedAccessToTheApplyJourney?.accessGranted),
      accessGrantedAt: notApplicableIfUndefined(formatDate(gainedAccessToTheApplyJourney?.accessGrantedAt, moment.ISO_8601))
    })
    rows.push(...groupedByPartitionKey[businessEmail]
      .filter(event => event.EventType === 'duplicate_submission')
      .map(event => JSON.parse(event.Payload))
      .map(payload => ({
        businessEmail: notApplicableIfUndefined(payload?.businessEmail),
        interestRegisteredAt: notApplicableIfUndefined(formatDate(payload?.createdAt, moment.ISO_8601)),
        eligibility: convertFromBoolean(false),
        ineligibleReason: 'duplicate submission',
        accessGranted: convertFromBoolean(false),
        accessGrantedAt: notApplicableIfUndefined(undefined)
      })))
  }
  rows.sort((a, b) => {
    return moment(b.interestRegisteredAt, 'DD/MM/YYYY HH:mm').valueOf() - moment(a.interestRegisteredAt, 'DD/MM/YYYY HH:mm').valueOf()
  })
  return rows
}

module.exports = createRows
