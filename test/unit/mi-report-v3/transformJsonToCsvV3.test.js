const { transformEventToCsvV3 } = require('../../../ffc-ahwr-mi-reporting/mi-report-v3/transformJsonToCsvV3')
// const { BlobServiceClient } = require('@azure/storage-blob')
// const fs = require('fs')

jest.mock('@azure/storage-blob')
jest.mock('fs')

// const expectedTransformedJsonHeader = [
//   'sbiFromPartitionKey',
//   'sessionId',
//   'eventType', // type
//   'message',
//   'reference',
//   'applicationReference',
//   'tempApplicationReference',
//   'tempClaimReference',
//   'typeOfClaim', // typeOfReview
//   'sbiFromPayload',
//   'crn',
//   'frn',
//   'farmerName',
//   'organisationName',
//   'userEmail',
//   'orgEmail',
//   'address',
//   'raisedBy',
//   'raisedOn',
//   'journey',
//   'confirmCheckDetails',
//   'eligibleSpecies', // old application journey
//   'agreeSameSpecies',
//   'agreeSpeciesNumbers',
//   'agreeVisitTimings',
//   'declaration',
//   'offerStatus',
//   'species', // whichReview
//   'detailsCorrect',
//   'typeOfLivestock',
//   'visitDate',
//   'dateOfSampling',
//   'vetName',
//   'vetRcvs',
//   'urnReference', // urnResult
//   'herdVaccinationStatus',
//   'numberOfOralFluidSamples',
//   'numberOfSamplesTested',
//   'numberAnimalsTested',
//   'testResults',
//   'vetVisitsReviewTestResults',
//   'sheepEndemicsPackage',
//   'sheepTests',
//   'sheepTestResults',
//   'piHunt',
//   'piHuntRecommended',
//   'piHuntAllAnimals',
//   'biosecurity',
//   'biosecurityAssessmentPercentage',
//   'diseaseStatus',
//   'claimPaymentAmount',
//   'latestEndemicsApplication',
//   'latestVetVisitApplication',
//   'relevantReviewForEndemics',
//   'claimed',
//   'exception',
//   'invalidClaimData',
//   'statusId',
//   'statusName',
//   'eventStatus'
// ]
// const events = [{
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventType: 'farmerApplyData-organisation',
//   EventRaised: new Date().toISOString(),
//   Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"reference":"TEMP-1234-ABCD","organisation":{"sbi":"123456","farmerName":"Farmer Brown","name":"Brown Cow Farm","email":"brown@test.com.test","orgEmail":"brownorg@test.com.test","address":"Yorkshire Moors,AB1 1AB,United Kingdom","crn":"0123456789","frn":"9876543210"}},"raisedBy":"brown@test.com.test","raisedOn":"2024-02-15T13:23:57.287Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'claim-organisation',
//   Payload: '{"type":"claim-organisation","message":"Session set for claim and organisation.","data":{"reference":"TEMP-1234-ABCD","applicationReference":"IAHW-1234-EFGH","organisation":{"sbi":"123456","farmerName":"Farmer Brown","name":"Brown Cow Farm","email":"brown@test.com.test","orgEmail":"brownorg@test.com.test","address":"Yorkshire Moors,AB1 1AB,United Kingdom","crn":"0123456789","frn":"9876543210"}},"raisedBy":"brown@test.com.test","raisedOn":"2024-03-05T15:57:39.590Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'farmerApplyData-declaration',
//   Payload: '{"type":"farmerApplyData-declaration","message":"Session set for farmerApplyData and declaration.","data":{"reference":"TEMP-1234-ABCD","declaration":true},"raisedBy":"brown@test.com.test","raisedOn":"2024-01-04T21:27:23.530Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'claim-vetName',
//   Payload: '{"type":"claim-vetName","message":"Session set for claim and vetName.","data":{"reference":"TEMP-1234-ABCD","applicationReference":"IAHW-1234-EFGH","vetName":"Freda George"},"raisedBy":"brown@test.com.test","raisedOn":"2024-01-04T21:27:23.530Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'claim-biosecurity',
//   Payload: '{"type":"claim-biosecurity","message":"Session set for claim and biosecurity.","data":{"reference":"TEMP-1234-ABCD","applicationReference":"IAHW-1234-EFGH","biosecurity":{"biosecurity":"yes","assessmentPercentage":"25"}},"raisedBy":"brown@test.com.test","raisedOn":"2024-01-04T21:27:23.530Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'claim-sheepTests',
//   Payload: '{"type":"claim-sheepTests","message":"Session set for claim and sheepTests.","data":{"reference":"TEMP-1234-ABCD","applicationReference":"IAHW-1234-EFGH","sheepTests":["eae","bd","liverFluke","other"]},"raisedBy":"brown@test.com.test","raisedOn":"2024-01-04T21:27:23.530Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'claim-sheepTests',
//   Payload: '{"type":"claim-sheepTests","message":"Session set for claim and sheepTests.","data":{"reference":"TEMP-1234-ABCD","applicationReference":"IAHW-1234-EFGH","sheepTests":"eae"},"raisedBy":"brown@test.com.test","raisedOn":"2024-01-04T21:27:23.530Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'claim-sheepTestResults',
//   Payload: '{"type":"claim-sheepTestResults","message":"Session set for claim and sheepTestResults.","data":{"reference":"TEMP-1234-ABCD","applicationReference":"IAHW-1234-EFGH","sheepTestResults":[{"diseaseType":"eae","result":"positive","isCurrentPage":false},{"diseaseType":"bd","result":"negative","isCurrentPage":false},{"diseaseType":"liverFluke","result":"clinicalSymptomsNotPresent","isCurrentPage":false},{"diseaseType":"other","result":[{"diseaseType":"Something nasty","testResult":"Positive"},{"diseaseType":"Something even worse","testResult":"No symptoms"}],"isCurrentPage":true}]},"raisedBy":"brown@test.com.test","raisedOn":"2024-01-04T21:27:23.530Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'claim-sheepTestResults',
//   Payload: '{"type":"claim-sheepTestResults","message":"Session set for claim and sheepTestResults.","data":{"reference":"TEMP-1234-ABCD","applicationReference":"IAHW-1234-EFGH","sheepTestResults":[{"diseaseType":"eae","result":"positive","isCurrentPage":false},{"diseaseType":"bd","result":"negative","isCurrentPage":false},{"diseaseType":"liverFluke","result":"clinicalSymptomsNotPresent","isCurrentPage":true}]},"raisedBy":"brown@test.com.test","raisedOn":"2024-01-04T21:27:23.530Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'claim-amount',
//   Payload: '{"type":"claim-amount","message":"Session set for claim and amount.","data":{"reference":"TEMP-1234-ABCD","applicationReference":"IAHW-1234-EFGH","amount":"350"},"raisedBy":"brown@test.com.test","raisedOn":"2024-01-04T21:27:23.530Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'claim-relevantReviewForEndemics',
//   //       {"type":"claim-relevantReviewForEndemics","message":"Session set for claim and relevantReviewForEndemics.","data":{"reference":"TEMP-CLAIM-4536-04F5","applicationReference":"IAHW-8CAD-7CA5","relevantReviewForEndemics":{"id":"d79f8008-746c-4ea5-a3c8-6f40a332554e","reference":"RESH-D79F-8008","applicationReference":"IAHW-8CAD-7CA5","data":{"amount":436,"vetsName":"Tom","claimType":"R","dateOfVisit":"2024-06-10T00:00:00.000Z","dateOfTesting":"2024-06-10T00:00:00.000Z","laboratoryURN":"123urn","vetRCVSNumber":"1234567","speciesNumbers":"yes","typeOfLivestock":"sheep","numberAnimalsTested":"42"},"statusId":9,"type":"R","createdAt":"2024-06-10T17:24:03.989Z","updatedAt":"2024-06-10T17:25:14.467Z","createdBy":"admin","updatedBy":"Developer","status":{"status":"READY TO PAY"}}},"raisedBy":"davidnorthb@htrondivado.com.test","raisedOn":"2024-06-11T15:52:44.023Z"}
//   Payload: '{"type":"claim-relevantReviewForEndemics","message":"Session set for claim and relevantReviewForEndemics.","data":{"reference":"TEMP-CLAIM-1234-ABCD","applicationReference":"IAHW-1234-EFGH","relevantReviewForEndemics":{"id":"123456789","reference":"RESH-12AB-34CD","applicationReference":"IAHW-12AB-34CD","data":{"amount":100,"vetsName":"Tom","claimType":"R","dateOfVisit":"2024-06-10T00:00:00.000Z","dateOfTesting":"2024-06-10T00:00:00.000Z","laboratoryURN":"123urn","vetRCVSNumber":"1234567","speciesNumbers":"yes","typeOfLivestock":"sheep","numberAnimalsTested":"42"},"statusId":9,"type":"R","createdAt":"2024-06-10T17:24:03.989Z","updatedAt":"2024-06-10T17:25:14.467Z","createdBy":"admin","updatedBy":"Developer","status":{"status":"READY TO PAY"}}},"raisedBy":"brown@test.com.test","raisedOn":"2024-01-04T21:27:23.530Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'ineligibility-event',
//   Payload: '{"type":"ineligibility-event","message":"Apply: LockedBusinessError","data":{"sbi":"123456","crn":"123456789","exception":"LockedBusinessError","raisedAt":"2024-02-15T13:23:39.830Z","journey":"apply","reference":"TEMP-1234-ABCD"},"raisedBy":"brown@test.com.test","raisedOn":"2024-02-15T13:23:40.068Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'claim-biosecurity-invalid',
//   Payload: '{"type":"claim-biosecurity-invalid","message":"biosecurity: Value no is not equal to required value yes","data":{"sbi":"123456","crn":"123456789","sessionKey":"biosecurity","exception":"Value no is not equal to required value yes","raisedAt":"2024-01-04T21:27:23.530Z","journey":"claim","reference":"TEMP-1234-ABCD","applicationReference":"IAHW-1234-EFGH"},"raisedBy":"brown@test.com.test","raisedOn":"2024-01-04T21:27:23.530Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'claim-numberOfOralFluidSamples-invalid',
//   Payload: '{"type":"claim-numberOfOralFluidSamples-invalid","message":"numberOfOralFluidSamples: Value 1 is less than required threshold 5","data":{"applicationReference":"IAHW-1234-EFGH","sbi":"123456","crn":"123456789","sessionKey":"numberOfOralFluidSamples","exception":"Value 1 is less than required threshold 5","raisedAt":"2024-01-04T21:27:23.530Z","journey":"claim","reference":"TEMP-1234-ABCD","applicationReference":"IAHW-1234-EFGH"},"raisedBy":"brown@test.com.test","raisedOn":"2024-01-04T21:27:23.530Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'application:status-updated:11',
//   Payload: '{"type":"application:status-updated:11","message":"Application has been updated","data":{"reference":"AHWR-04DC-5073","statusId":11},"raisedBy":"someuser@email.com","raisedOn":"2024-01-19T15:32:07.574Z","timestamp":"2024-01-19T15:32:07.616Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'application:status-updated:5',
//   Payload: '{"type":"application:status-updated:5","message":"New claim has been created","data":{"reference":"REPI-04DC-5073","applicationReference":"IAHW-1234-EFGH","statusId":5},"raisedBy":"someuser@email.com","raisedOn":"2024-01-19T15:32:07.574Z","timestamp":"2024-01-19T15:32:07.616Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'application:status-updated:5',
//   Payload: '{"type":"application:status-updated:5","message":"New stage execution has been created","data":{"reference":"AHWR-04DC-5073","statusId":5,"subStatus":"Recommend to pay"},"raisedBy":"someuser@email.com","raisedOn":"2024-01-19T15:32:07.574Z","timestamp":"2024-01-19T15:32:07.616Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'application:status-updated:5',
//   Payload: '{"type":"application:status-updated:5","message":"New stage execution has been created","data":{"reference":"AHWR-04DC-5073","statusId":5,"subStatus":"Recommend to reject"},"raisedBy":"someuser@email.com","raisedOn":"2024-01-19T15:32:07.574Z","timestamp":"2024-01-19T15:32:07.616Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'application:status-updated:12',
//   Payload: '{"type":"application:status-updated:12","message":"Claim has been updated","data":{"reference":"REPI-04DC-5073","applicationReference":"IAHW-1234-EFGH","statusId":12},"raisedBy":"someuser@email.com","raisedOn":"2024-01-19T15:32:07.574Z","timestamp":"2024-01-19T15:32:07.616Z"}'
// },
// {
//   partitionKey: '123456',
//   SessionId: '789123456',
//   EventRaised: new Date().toISOString(),
//   EventType: 'application:status-updated:13',
//   Payload: '{"type":"application:status-updated:13","message":"Claim has been updated","data":{"reference":"REPI-04DC-5073","applicationReference":"IAHW-1234-EFGH","statusId":13},"raisedBy":"someuser@email.com","raisedOn":"2024-01-19T15:32:07.574Z","timestamp":"2024-01-19T15:32:07.616Z"}'
// }
// ]

const consoleSpy = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {})

let result

test('no events found', async () => {
  const noEvents = []
  result = await transformEventToCsvV3(noEvents)

  expect(consoleSpy).toHaveBeenCalledWith('No events found')
  expect(result).toBe(undefined)

  consoleSpy.mockReset()
})
