const moment = require('moment')
const groupByPartitionKey = require('../storage/group-by-partition-key')
const notApplicableIfUndefined = require('../csv/not-applicable-if-undefined')
const formatDate = require('../csv/format-date')

const createRows = (events) => {
  const rows = []
  const groupedByPartitionKey = groupByPartitionKey(events)
  for (const sbi in groupedByPartitionKey) {
    const exceptionEvents = groupedByPartitionKey[sbi].filter(
      event => event.EventType.startsWith('exception-event')
    ).map(event => JSON.parse(event.Payload || '{}'))
    exceptionEvents.forEach(payload => {
      rows.push({
        sbi: notApplicableIfUndefined(payload?.sbi),
        crn: notApplicableIfUndefined(payload?.crn),
        exceptionRaisedAt: notApplicableIfUndefined(formatDate(payload?.raisedAt, moment.ISO_8601)),
        exceptionReason: notApplicableIfUndefined(payload?.exception),
        journey: notApplicableIfUndefined(payload?.journey)
      })
    })
  }
  rows.sort((a, b) => {
    return moment(b.exceptionRaisedAt, 'DD/MM/YYYY HH:mm').valueOf() - moment(a.exceptionRaisedAt, 'DD/MM/YYYY HH:mm').valueOf()
  })
  return rows
}

module.exports = createRows
