const moment = require('moment')
const groupByPartitionKey = require('../storage/group-by-partition-key')
const notApplicableIfUndefined = require('../csv/not-applicable-if-undefined')
const convertFromBoolean = require('../csv/convert-from-boolean')
const formatDate = require('../csv/format-date')

const createRows = (events) => {
  const rows = []
  const groupedByPartitionKey = groupByPartitionKey(events)
  for (const sbi in groupedByPartitionKey) {
    const payload = JSON.parse(groupedByPartitionKey[sbi].find(
      event => event.EventType.startsWith('exception-event')
    )?.Payload ?? '{}')
    rows.push({
      sbi: notApplicableIfUndefined(payload?.sbi),
      crn: notApplicableIfUndefined(payload?.crn),
      exceptionRaisedAt: notApplicableIfUndefined(formatDate(registrationOfInterest?.createdAt, moment.ISO_8601)),
      exceptionReason: notApplicableIfUndefined(payload?.exception),
      journey: notApplicableIfUndefined(payload?.journey)
    })
  }
  rows.sort((a, b) => {
    return moment(b.exceptionRaisedAt, 'DD/MM/YYYY HH:mm').valueOf() - moment(a.exceptionRaisedAt, 'DD/MM/YYYY HH:mm').valueOf()
  })
  return rows
}

module.exports = createRows
