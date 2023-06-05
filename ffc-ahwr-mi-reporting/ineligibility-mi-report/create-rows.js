const moment = require('moment')
const groupByPartitionKey = require('../storage/group-by-partition-key')
const notApplicableIfUndefined = require('../csv/not-applicable-if-undefined')
const formatDate = require('../csv/format-date')

const createRows = (events) => {
  const rows = []
  const groupedByPartitionKey = groupByPartitionKey(events)
  for (const sbi in groupedByPartitionKey) {
    const ineligibilityEvents = groupedByPartitionKey[sbi].filter(
      event => event.EventType.startsWith('ineligibility-event')
    ).map(event => JSON.parse(event.Payload || '{}'))
    ineligibilityEvents.forEach(payload => {
      rows.push({
        sbi: notApplicableIfUndefined(payload?.sbi),
        crn: notApplicableIfUndefined(payload?.crn),
        raisedAt: notApplicableIfUndefined(formatDate(payload?.raisedAt, moment.ISO_8601)),
        ineligibilityReason: notApplicableIfUndefined(payload?.exception),
        journey: notApplicableIfUndefined(payload?.journey)
      })
    })
  }
  rows.sort((a, b) => {
    return moment(b.raisedAt, 'DD/MM/YYYY HH:mm').valueOf() - moment(a.raisedAt, 'DD/MM/YYYY HH:mm').valueOf()
  })
  return rows
}

module.exports = createRows
