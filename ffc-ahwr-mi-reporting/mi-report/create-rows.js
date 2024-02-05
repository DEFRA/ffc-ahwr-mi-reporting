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
  rejected: 10,
  onHold: 11,
  recommendedToPay: 12,
  recommendedToReject: 13
}

const createRow = (events) => {
  const organisationData = parsePayload(events, 'farmerApplyData-organisation')
  const organisation = organisationData?.data?.organisation

  const whichReview = parseData(events, 'farmerApplyData-whichReview', 'whichReview')
  const eligibleSpecies = parseData(events, 'farmerApplyData-eligibleSpecies', 'eligibleSpecies')
  const confirmCheckDetails = parseData(events, 'farmerApplyData-confirmCheckDetails', 'confirmCheckDetails')

  const agreementReferenceFromFarmerApplyData = parseData(events, 'farmerApplyData-reference', 'reference')
  const agreementReference = agreementReferenceFromFarmerApplyData.value !== '' ? agreementReferenceFromFarmerApplyData : parseData(events, 'application:status-updated', 'reference')
  const agreementDeclaration = parseData(events, 'farmerApplyData-declaration', 'declaration')

  const claimDetailsCorrect = parseData(events, 'claim-detailsCorrect', 'detailsCorrect')
  const claimVisitDate = parseData(events, 'claim-visitDate', 'visitDate')
  const claimDateOfTesting = parseData(events, 'claim-dateOfTesting', 'dateOfTesting')
  const claimVetName = parseData(events, 'claim-vetName', 'vetName')
  const claimVetRcvs = parseData(events, 'claim-vetRcvs', 'vetRcvs')
  const claimUrnResult = parseData(events, 'claim-urnResult', 'urnResult')
  const claimClaimed = parseData(events, 'claim-claimed', 'claimed')

  const agreementWithdrawn = parseData(events, `application:status-updated:${applicationStatus.withdrawn}`, 'statusId')
  const claimApproved = parseData(events, `application:status-updated:${applicationStatus.readyToPay}`, 'statusId')
  const claimRejected = parseData(events, `application:status-updated:${applicationStatus.rejected}`, 'statusId')
  const agreementCurrentStatusId = parseData(events, 'application:status-updated', 'statusId')

  // To handle previously submitted claims with In Check status & sub-status of recommended to pay or reject:
  const claimRecommendationWithInCheckSubStatus = parseData(events, `application:status-updated:${applicationStatus.inCheck}`, 'subStatus')
  const claimRecommendedToPay = parseData(events, `application:status-updated:${applicationStatus.recommendedToPay}`, 'statusId')
  const recommendedToPayTrue = (claimRecommendedToPay?.value === applicationStatus.recommendedToPay) || (claimRecommendationWithInCheckSubStatus?.value === 'Recommend to pay')

  const claimRecommendedToReject = parseData(events, `application:status-updated:${applicationStatus.recommendedToReject}`, 'statusId')
  const recommendedToRejectTrue = (claimRecommendedToReject?.value === applicationStatus.recommendedToReject) || (claimRecommendationWithInCheckSubStatus?.value === 'Recommend to reject')

  const claimRecommendedOn = () => {
    if (recommendedToPayTrue) {
      return claimRecommendedToPay.raisedOn || claimRecommendationWithInCheckSubStatus.raisedOn
    } else if (recommendedToRejectTrue) {
      return claimRecommendedToReject.raisedOn || claimRecommendationWithInCheckSubStatus.raisedOn
    } else {
      return ''
    }
  }
  const claimRecommendedBy = () => {
    if (recommendedToPayTrue) {
      return claimRecommendedToPay.raisedBy.replace(/,/g, '","') || claimRecommendationWithInCheckSubStatus.raisedBy.replace(/,/g, '","')
    } else if (recommendedToRejectTrue) {
      return claimRecommendedToReject.raisedBy.replace(/,/g, '","') || claimRecommendationWithInCheckSubStatus.raisedBy.replace(/,/g, '","')
    } else {
      return ''
    }
  }

  const currentStatus = () => {
    if (!claimApproved.value && !claimRejected.value && recommendedToPayTrue) {
      return 'RECOMMENDED TO PAY'
    } else if (!claimApproved.value && !claimRejected.value && recommendedToRejectTrue) {
      return 'RECOMMENDED TO REJECT'
    } else {
      return agreementStatusIdToString(agreementCurrentStatusId.value)
    }
  }

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
    claimDateOfTesting: formatDate(claimDateOfTesting?.value, moment.ISO_8601, 'DD/MM/YYYY'),
    claimDateOfTestingRaisedOn: claimDateOfTesting?.raisedOn,
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
    recommendedToPay: recommendedToPayTrue ? 'yes' : '',
    recommendedToReject: recommendedToRejectTrue ? 'yes' : '',
    recommendedOn: claimRecommendedOn(),
    recommendedBy: claimRecommendedBy(),
    claimApproved: convertFromBoolean(claimApproved?.value === applicationStatus.readyToPay),
    claimApprovedOn: notApplicableIfUndefined(claimApproved?.raisedOn),
    claimApprovedBy: notApplicableIfUndefined(claimApproved?.raisedBy.replace(/,/g, '')),
    claimRejected: convertFromBoolean(claimRejected?.value === applicationStatus.rejected),
    claimRejectedOn: notApplicableIfUndefined(claimRejected?.raisedOn),
    claimRejectedBy: notApplicableIfUndefined(claimRejected?.raisedBy.replace(/,/g, '')),
    agreementCurrentStatus: notApplicableIfUndefined(currentStatus())
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

      const eventTypeClaimStatuses = [
        `application:status-updated:${applicationStatus.readyToPay}`,
        `application:status-updated:${applicationStatus.rejected}`,
        `application:status-updated:${applicationStatus.inCheck}`,
        `application:status-updated:${applicationStatus.onHold}`,
        `application:status-updated:${applicationStatus.recommendedToPay}`,
        `application:status-updated:${applicationStatus.recommendedToReject}`
      ]
      // TODO Should be refactored
      const claimEvents = eventTypeClaimStatuses.includes(applicationEvents[applicationEvents.length - 1].EventType)
        ? sbiEvents.filter(event => `${event.EventType}`.startsWith('claim'))
        : []
      if (applicationEvents[applicationEvents.length - 1].EventType === `application:status-updated:${applicationStatus.onHold}`) {
        sbiEvents.filter(event => `${event.EventType}`.startsWith('claim')).forEach(s => console.log(s))
      }
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
