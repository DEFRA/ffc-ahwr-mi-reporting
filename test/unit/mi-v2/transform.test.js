const transformJsonToCsv = require('../../../ffc-ahwr-mi-reporting/mi-report-v2/transform')

const events = [{
  partitionKey: '123456',
  EventType: 'farmerApplyData-organisation',
  EventRaised: new Date().toISOString(),
  Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"reference":"TEMP-931B-C490","organisation":{"sbi":"106401373","farmerName":"Trevor John Hale","name":"M & G Williams","email":"trevorhalec@elahroverts.com.test","address":""}},"raisedBy":"trevorhalec@elahroverts.com.test","raisedOn":"2024-02-15T13:23:57.287Z"}'
}, {
  partitionKey: '123456',
  EventRaised: new Date().toISOString(),
  EventType: 'ineligibility-event',
  Payload: '{"type":"ineligibility-event","message":"Apply: LockedBusinessError","data":{"sbi":"106363424","crn":"1100514988","exception":"LockedBusinessError","raisedAt":"2024-02-15T13:23:39.830Z","journey":"apply","reference":"TEMP-EFF4-B965"},"raisedBy":"trevorhalec@elahroverts.com.test","raisedOn":"2024-02-15T13:23:40.068Z"}'
}]

describe('events are transformed to remove json structure', () => {
  let result

  beforeEach(() => {
    result = transformJsonToCsv(events)
  })

  test('csv content includes header row', () => {
    const expectedTransformedJsonHeader = 'sbiFromPartitionKey,type,message,reference,tempReference,sbiFromPayload,farmerName,organisationName,email,address,raisedBy,raisedOn,journey,confirmCheckDetails,eligibleSpecies,declaration,whichReview,detailsCorrect,visitDate,dateOfTesting,vetName,vetRcvs,urnResult,animalsTested,claimed,statusId,statusName,eventStatus'
    expect(result).toContain(expectedTransformedJsonHeader)
  })

  test('csv content includes sample data from event - test 1', () => {
    const expectedTransformedJsonExample1 = '123456,farmerApplyData-organisation,Session set for farmerApplyData and organisation.,TEMP-931B-C490'
    expect(result).toContain(expectedTransformedJsonExample1)
  })

  test('csv content includes sample data from event - test 2', () => {
    const expectedTransformedJsonExample2 = '123456,ineligibility-event,Apply: LockedBusinessError,TEMP-EFF4-B965'
    expect(result).toContain(expectedTransformedJsonExample2)
  })
})
