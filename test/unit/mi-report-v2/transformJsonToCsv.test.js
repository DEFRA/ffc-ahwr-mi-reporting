const transformJsonToCsv = require('../../../ffc-ahwr-mi-reporting/mi-report-v2/transformJsonToCsv')

const events = [{
  partitionKey: '123456',
  SessionId: '789123456',
  EventType: 'farmerApplyData-organisation',
  EventRaised: new Date().toISOString(),
  Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"reference":"TEMP-931B-C490","organisation":{"sbi":"106401373","farmerName":"Trevor John Hale","name":"M & G Williams","email":"trevorhalec@elahroverts.com.test","address":""}},"raisedBy":"trevorhalec@elahroverts.com.test","raisedOn":"2024-02-15T13:23:57.287Z"}'
}, {
  partitionKey: '123456',
  SessionId: '789123456',
  EventRaised: new Date().toISOString(),
  EventType: 'ineligibility-event',
  Payload: '{"type":"ineligibility-event","message":"Apply: LockedBusinessError","data":{"sbi":"106363424","crn":"1100514988","exception":"LockedBusinessError","raisedAt":"2024-02-15T13:23:39.830Z","journey":"apply","reference":"TEMP-EFF4-B965"},"raisedBy":"trevorhalec@elahroverts.com.test","raisedOn":"2024-02-15T13:23:40.068Z"}'
},
{
  partitionKey: '123456',
  SessionId: '789123456',
  EventRaised: new Date().toISOString(),
  EventType: 'endemicsClaim-organisation',
  Payload: '{"type":"endemicsClaim-organisation","message":"Session set for endemicsClaim and organisation.","data":{"organisation":{"sbi":"200523665","farmerName":"Thomas Hoggarth","name":"Mossy Lea Farm LLP","email":"thomashoggarthj@htraggohsamohtk.com.test","address":"APPLEBY-IN-WESTMORLAND,EX18 7SB,United Kingdom"}},"raisedBy":"thomashoggarthj@htraggohsamohtk.com.test","raisedOn":"2024-03-05T15:57:39.590Z"}'
},
{
  partitionKey: '123456',
  SessionId: '789123456',
  EventRaised: new Date().toISOString(),
  EventType: 'farmerApplyData-declaration',
  Payload: '{"type":"farmerApplyData-declaration","message":"Session set for farmerApplyData and declaration.","data":{"reference":"TEMP-5D55-C375","declaration":true},"raisedBy":"thomashoggarthj@htraggohsamohtk.com.test","raisedOn":"2024-01-04T21:27:23.530Z"}'
}
]

describe('events are transformed to remove json structure', () => {
  let result

  beforeEach(() => {
    result = transformJsonToCsv(events)
  })

  test('csv content includes header row', () => {
    const expectedTransformedJsonHeader = 'sbiFromPartitionKey,sessionId,type,message,reference,tempReference,sbiFromPayload,farmerName,organisationName,email,address,raisedBy,raisedOn,journey,confirmCheckDetails,eligibleSpecies,declaration,whichReview,detailsCorrect,visitDate,dateOfTesting,vetName,vetRcvs,urnResult,animalsTested,claimed,statusId,statusName,eventStatus'
    expect(result).toContain(expectedTransformedJsonHeader)
  })

  test('csv content includes sample data from event - farmerApplyData-organisation', () => {
    const expectedTransformedJsonExample1 = '123456,789123456,farmerApplyData-organisation,Session set for farmerApplyData and organisation.,TEMP-931B-C490'
    expect(result).toContain(expectedTransformedJsonExample1)
  })

  test('csv content includes sample data from event - ineligibility-event', () => {
    const expectedTransformedJsonExample2 = '123456,789123456,ineligibility-event,Apply: LockedBusinessError,TEMP-EFF4-B965,,,,,,,trevorhalec@elahroverts.com.test,2024-02-15T13:23:40.068Z,apply,,,,,,,,,,,,,,,'
    expect(result).toContain(expectedTransformedJsonExample2)
  })

  test('csv content includes sample data from event - endemicsClaim-organisation', () => {
    const expectedTransformedJsonExample3 = '123456,789123456,endemicsClaim-organisation,Session set for endemicsClaim and organisation.,,,200523665,Thomas Hoggarth,Mossy Lea Farm LLP,thomashoggarthj@htraggohsamohtk.com.test,APPLEBY-IN-WESTMORLAND  EX18 7SB  United Kingdom,thomashoggarthj@htraggohsamohtk.com.test,2024-03-05T15:57:39.590Z,,,,,,,,,,,,,,,,'
    expect(result).toContain(expectedTransformedJsonExample3)
  })

  test('csv content includes sample data from event - farmerApplyData-declaration', () => {
    const expectedTransformedJsonExample3 = '123456,789123456,farmerApplyData-declaration,Session set for farmerApplyData and declaration.,TEMP-5D55-C375,,,,,,,thomashoggarthj@htraggohsamohtk.com.test,2024-01-04T21:27:23.530Z,,,,true,,,,,,,,,,,,'
    expect(result).toContain(expectedTransformedJsonExample3)
  })
})
