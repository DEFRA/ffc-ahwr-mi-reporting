const moment = require('moment')
const groupByPartitionKey = require('../storage/group-by-partition-key')
const { parseData, parsePayload, formatDate } = require('../parse-data')
const convertFromBoolean = require('../csv/convert-from-boolean')
const notApplicableIfUndefined = require('../csv/not-applicable-if-undefined')
const agreementStatusIdToString = require('./agreement-status-id-to-string')

const applicationStatus = {
  withdrawn: 2,
  inCheck: 5,
  readyToPay: 9,
  rejected: 10
}

const createRow = (events) => {
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

  const agreementWithdrawn = parseData(events, `application:status-updated:${applicationStatus.withdrawn}`, 'statusId')
  const claimApproved = parseData(events, `application:status-updated:${applicationStatus.readyToPay}`, 'statusId')
  const claimRejected = parseData(events, `application:status-updated:${applicationStatus.rejected}`, 'statusId')
  const agreementCurrentStatusId = parseData(events, 'application:status-updated', 'statusId')

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
    claimVetName: claimVetName?.value.replace(/,/g, ''),
    claimVetNameRaisedOn: claimVetName?.raisedOn,
    claimVetRcvs: claimVetRcvs?.value,
    claimVetRcvsRaisedOn: claimVetRcvs?.raisedOn,
    claimUrnResult: claimUrnResult?.value.toString().replace(/,/g, ''),
    claimUrnResultRaisedOn: claimUrnResult?.raisedOn,
    claimClaimed: claimClaimed?.value,
    claimClaimedRaisedOn: claimClaimed?.raisedOn,
    applicationWithdrawn: convertFromBoolean(agreementWithdrawn?.value === applicationStatus.withdrawn),
    applicationWithdrawnOn: notApplicableIfUndefined(agreementWithdrawn?.raisedOn),
    applicationWithdrawnBy: notApplicableIfUndefined(agreementWithdrawn?.raisedBy.replace(/,/g, '')),
    claimApproved: convertFromBoolean(claimApproved?.value === applicationStatus.readyToPay),
    claimApprovedOn: notApplicableIfUndefined(claimApproved?.raisedOn),
    claimApprovedBy: notApplicableIfUndefined(claimApproved?.raisedBy.replace(/,/g, '')),
    claimRejected: convertFromBoolean(claimRejected?.value === applicationStatus.rejected),
    claimRejectedOn: notApplicableIfUndefined(claimRejected?.raisedOn),
    claimRejectedBy: notApplicableIfUndefined(claimRejected?.raisedBy.replace(/,/g, '')),
    agreementCurrentStatus: notApplicableIfUndefined(agreementStatusIdToString(agreementCurrentStatusId?.value))
  }
}

const groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x)
    return rv
  }, {})
}

const createRows = (events) => {
  const rows = []
  const groupedBySbi = groupByPartitionKey(events)
  for (const sbi in groupedBySbi) {
    const sbiEvents = groupedBySbi[sbi]
      .filter(event => !`${event.EventType}`.startsWith('auto-eligibility'))

    const statusUpdatedEvents = groupBy(
      sbiEvents.filter(event => `${event.EventType}`.startsWith('application:status-updated')),
      'SessionId'
    )
    Object.keys(statusUpdatedEvents).forEach(applicationId => {
      const applicationEvents = statusUpdatedEvents[applicationId]

      const referenceEvent = sbiEvents.find(e =>
        `${e.EventType}`.startsWith('farmerApplyData-reference') &&
        JSON.parse(e.Payload).data.reference === JSON.parse(applicationEvents[0].Payload).data.reference
      )
      if (typeof referenceEvent === 'undefined') {
        return
      }

      const applyEvents = sbiEvents
        .filter(event => `${event.EventType}`.startsWith('farmerApplyData'))
        .filter(event => new Date(event.timestamp).getTime() <= new Date(referenceEvent.timestamp).getTime())

      const claimEvents = applicationEvents[applicationEvents.length - 1].EventType === `application:status-updated:${applicationStatus.readyToPay}` ||
      applicationEvents[applicationEvents.length - 1].EventType === `application:status-updated:${applicationStatus.rejected}` ||
      applicationEvents[applicationEvents.length - 1].EventType === `application:status-updated:${applicationStatus.inCheck}`
        ? sbiEvents.filter(event => `${event.EventType}`.startsWith('claim'))
        : []

      rows.push(createRow([
        ...applicationEvents,
        ...applyEvents,
        ...claimEvents
      ]))
    })
    if (sbiEvents.length > 0 && Object.keys(statusUpdatedEvents).length === 0) {
      rows.push(createRow(
        sbiEvents
      ))
    }
  }
  return rows
}

module.exports = createRows
