const moment = require('moment')
const groupByPartitionKey = require('../group-by-partition-key')
const { parseData, parsePayload, formatDate } = require('../parse-data')
const convertFromBoolean = require('../convert-from-boolean')

const parseCsvData = (events) => {
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
    claimVetName: claimVetName?.value,
    claimVetNameRaisedOn: claimVetName?.raisedOn,
    claimVetRcvs: claimVetRcvs?.value,
    claimVetRcvsRaisedOn: claimVetRcvs?.raisedOn,
    claimUrnResult: claimUrnResult?.value.toString(),
    claimUrnResultRaisedOn: claimUrnResult?.raisedOn,
    claimClaimed: claimClaimed?.value,
    claimClaimedRaisedOn: claimClaimed?.raisedOn
  }
}

const parseEvents = (events) => {
  const miParsedData = []
  const eventByPartitionKey = groupByPartitionKey(events)
  for (const eventGroup in eventByPartitionKey) {
    const eventData = eventByPartitionKey[eventGroup]
    const filteredEvents = eventData.filter(event => !`${event.EventType}`.startsWith('auto-eligibility'))
    if (filteredEvents.length !== 0) {
      miParsedData.push(parseCsvData(filteredEvents))
    }
  }
  return miParsedData
}

module.exports = parseEvents
