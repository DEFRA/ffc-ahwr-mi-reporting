const moment = require('moment')
const groupByPartitionKey = require('../storage/group-by-partition-key')
const getAllApplications = require('../api/get-all-applications')
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

/**
 * This function creates one row on the MI report per application from the application database. Most 
 * of the data is derived from the application database table, but additional columns are derived from
 * event data regarding backoffice RBAC activity.
 * @param {*} events data from the event store table
 * @param {*} applicationData data for a given application in the database
 * @returns a unique row for the MI report
 */
const createRow = (events, applicationData) => {
  const agreementNumber = applicationData.reference
    const sbi = applicationData.data.organisation.sbi

    // aggregates together all events for a given SBI. Note this can be across multiple journeys and ultimately agreements.
    const groupBySbiPartition = groupByPartitionKey(events)[sbi]

    // this ensures we narrow down events for a given SBI to the agreement reference they below to
    const applicationReferenceNumberEvents = groupBySbiPartition.filter(event => JSON.parse(event.Payload).data.reference && JSON.parse(event.Payload).data.reference === agreementNumber)
    
    const agreementWithdrawn = parseData(applicationReferenceNumberEvents, `application:status-updated:${applicationStatus.withdrawn}`, 'statusId')
    const claimApproved = parseData(applicationReferenceNumberEvents, `application:status-updated:${applicationStatus.readyToPay}`, 'statusId')
    const claimRejected = parseData(applicationReferenceNumberEvents, `application:status-updated:${applicationStatus.rejected}`, 'statusId')
    const claimRecommendation = parseData(applicationReferenceNumberEvents, `application:status-updated:${applicationStatus.inCheck}`, 'subStatus')
    
  
    const row = {
      sbi: applicationData.data.organisation.sbi,
      name: applicationData.data.organisation.name.replace(/,/g, '","'),
      farmerName: applicationData.data.organisation.farmerName.replace(/,/g, '","'),
      address: applicationData.data.organisation.address.replace(/,/g, '","'),
      email: applicationData.data.organisation.email,
      whichReview:  applicationData.data.whichReview,
      eligibleSpecies: applicationData.data.eligibleSpecies,
      confirmCheckDetails:  applicationData.data.confirmCheckDetails,
      declaration: applicationData.data.declaration,
      applicationNumber: applicationData.reference,
      claimDetailsCorrect: applicationData.data.detailsCorrect,
      claimVisitDate: formatDate(applicationData.data.visitDate, moment.ISO_8601, 'DD/MM/YYYY'),
      claimDateOfTesting: formatDate(applicationData.data.dateOfTesting, moment.ISO_8601, 'DD/MM/YYYY'),
      claimVetName: applicationData.data.vetName?.replace(/,/g, ''),
      claimVetRcvs: applicationData.data.vetRcvs,
      claimUrnResult: applicationData.data.urnResult?.replace(/,/g, ''),
      applicationWithdrawn: applicationData.statusId === 2,
      applicationWithdrawnOn: notApplicableIfUndefined(agreementWithdrawn?.raisedOn),
      applicationWithdrawnBy: notApplicableIfUndefined(agreementWithdrawn?.raisedBy.replace(/,/g, '')),
      recommendedToPay: claimRecommendation?.value
        ? (claimRecommendation?.value === 'Recommend to pay' ? 'yes' : 'no')
        : '',
      recommendedToReject: claimRecommendation?.value
        ? (claimRecommendation?.value === 'Recommend to reject' ? 'yes' : 'no')
        : '',
      recommendedOn: claimRecommendation?.value ? claimRecommendation?.raisedOn : '',
      recommendedBy: claimRecommendation?.value ? claimRecommendation?.raisedBy.replace(/,/g, '","') : '',
      claimApproved: convertFromBoolean(claimApproved?.value === applicationStatus.readyToPay),
      claimApprovedOn: notApplicableIfUndefined(claimApproved?.raisedOn),
      claimApprovedBy: notApplicableIfUndefined(claimApproved?.raisedBy.replace(/,/g, '')),
      claimRejected: convertFromBoolean(claimRejected?.value === applicationStatus.rejected),
      claimRejectedOn: notApplicableIfUndefined(claimRejected?.raisedOn),
      claimRejectedBy: notApplicableIfUndefined(claimRejected?.raisedBy.replace(/,/g, '')),
      agreementCurrentStatus: applicationData.statusId // map this to the human readable status
    }
    return row
}

const createRows = async (events) => {
  const applications = await getAllApplications()
  const rows = []
  for(const application in applications) {
    const applicationData = applications[application]
    rows.push(createRow(events, applicationData))
  }

  return rows
}

module.exports = createRows
