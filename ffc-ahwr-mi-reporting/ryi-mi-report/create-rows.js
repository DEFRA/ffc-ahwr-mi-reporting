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
      businessEmail: notApplicableIfUndefined(registrationOfInterest?.businessEmail),
      interestRegisteredAt: notApplicableIfUndefined(formatDate(registrationOfInterest?.createdAt, moment.ISO_8601)),
      accessGranted: convertFromBoolean(gainedAccessToTheApplyJourney?.accessGranted),
      accessGrantedAt: notApplicableIfUndefined(formatDate(gainedAccessToTheApplyJourney?.accessGrantedAt, moment.ISO_8601))
    })
  }
  return rows
}

module.exports = createRows
