const transformJsonToCsv = require('../../../ffc-ahwr-mi-reporting/mi-report-v2/transformJsonToCsv')

const events = [{
  partitionKey: '123456',
  SessionId: '789123456',
  EventType: 'farmerApplyData-organisation',
  EventRaised: new Date().toISOString(),
  Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"reference":"TEMP-1234-ABCD","organisation":{"sbi":"123456","farmerName":"Farmer Brown","name":"Brown Cow Farm","email":"brown@test.com.test","address":""}},"raisedBy":"brown@test.com.test","raisedOn":"2024-02-15T13:23:57.287Z"}'
}, {
  partitionKey: '123456',
  SessionId: '789123456',
  EventRaised: new Date().toISOString(),
  EventType: 'ineligibility-event',
  Payload: '{"type":"ineligibility-event","message":"Apply: LockedBusinessError","data":{"sbi":"123456","crn":"123456789","exception":"LockedBusinessError","raisedAt":"2024-02-15T13:23:39.830Z","journey":"apply","reference":"TEMP-1234-ABCD"},"raisedBy":"brown@test.com.test","raisedOn":"2024-02-15T13:23:40.068Z"}'
},
{
  partitionKey: '123456',
  SessionId: '789123456',
  EventRaised: new Date().toISOString(),
  EventType: 'endemicsClaim-organisation',
  Payload: '{"type":"endemicsClaim-organisation","message":"Session set for endemicsClaim and organisation.","data":{"organisation":{"sbi":"123456","farmerName":"Farmer Brown","name":"Brown Cow Farm","email":"brown@test.com.test","address":"Yorkshire Moors,AB1 1AB,United Kingdom"}},"raisedBy":"brown@test.com.test","raisedOn":"2024-03-05T15:57:39.590Z"}'
},
{
  partitionKey: '123456',
  SessionId: '789123456',
  EventRaised: new Date().toISOString(),
  EventType: 'farmerApplyData-declaration',
  Payload: '{"type":"farmerApplyData-declaration","message":"Session set for farmerApplyData and declaration.","data":{"reference":"TEMP-1234-ABCD","declaration":true},"raisedBy":"brown@test.com.test","raisedOn":"2024-01-04T21:27:23.530Z"}'
},
{
  partitionKey: '123456',
  SessionId: '789123456',
  EventRaised: new Date().toISOString(),
  EventType: 'claim-vetName',
  Payload: '{"type":"claim-vetName","message":"Session set for claim and vetName.","data":{"reference":"TEMP-1234-ABCD","vetName":"Freda George"},"raisedBy":"brown@test.com.test","raisedOn":"2024-01-04T21:27:23.530Z"}'
},
{
  partitionKey: '123456',
  SessionId: '789123456',
  EventRaised: new Date().toISOString(),
  EventType: 'application:status-updated:5',
  Payload: '{"type":"application:status-updated:5","message":"New stage execution has been created","data":{"reference":"AHWR-04DC-5073","statusId":5,"subStatus":"Recommend to pay"},"raisedBy":"someuser@email.com","raisedOn":"2024-01-19T15:32:07.574Z","timestamp":"2024-01-19T15:32:07.616Z"}'
},
{
  partitionKey: '123456',
  SessionId: '789123456',
  EventRaised: new Date().toISOString(),
  EventType: 'application:status-updated:5',
  Payload: '{"type":"application:status-updated:5","message":"New stage execution has been created","data":{"reference":"AHWR-04DC-5073","statusId":5,"subStatus":"Recommend to reject"},"raisedBy":"someuser@email.com","raisedOn":"2024-01-19T15:32:07.574Z","timestamp":"2024-01-19T15:32:07.616Z"}'
}

]

const consoleSpy = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {})

let result

test('no events found', () => {
  const noEvents = []
  result = transformJsonToCsv(noEvents)

  expect(consoleSpy).toHaveBeenCalledWith('No events found')
  expect(result).toBe(undefined)

  consoleSpy.mockReset()
})

describe('parsePayload', () => {
  test('parsePayload', () => {
    const event = events[0]
    result = JSON.parse(event.Payload)

    const { type, data, raisedBy, raisedOn, message } = result
    expect(type).toBe('farmerApplyData-organisation')
    expect(data).toMatchObject({ organisation: { address: '', email: 'brown@test.com.test', farmerName: 'Farmer Brown', name: 'Brown Cow Farm', sbi: '123456' }, reference: 'TEMP-1234-ABCD' })
    expect(raisedBy).toBe('brown@test.com.test')
    expect(raisedOn).toBe('2024-02-15T13:23:57.287Z')
    expect(message).toBe('Session set for farmerApplyData and organisation.')
  })

  test('parsePayload error', () => {
    const eventWithoutCompleteData = {
      partitionKey: '123456',
      SessionId: '789123456',
      EventType: 'farmerApplyData-organisation',
      EventRaised: new Date().toISOString(),
      Payload: ''
    }
    const testEvents = [eventWithoutCompleteData]
    result = transformJsonToCsv(testEvents)

    expect(consoleSpy).toHaveBeenCalledTimes(1)
    expect(consoleSpy.mock.calls.flat().toString()).toContain('Parse event error')

    consoleSpy.mockReset()
  })
})

describe('events are transformed to remove json structure', () => {
  beforeEach(() => {
    result = transformJsonToCsv(events)
  })

  test('csv content includes header row', () => {
    const expectedTransformedJsonHeader = 'sbiFromPartitionKey,sessionId,type,message,reference,tempReference,sbiFromPayload,farmerName,organisationName,email,address,raisedBy,raisedOn,journey,confirmCheckDetails,eligibleSpecies,declaration,whichReview,detailsCorrect,visitDate,dateOfTesting,vetName,vetRcvs,urnResult,animalsTested,claimed,statusId,statusName,eventStatus'
    expect(result).toContain(expectedTransformedJsonHeader)
  })

  test('csv content includes sample data from event - farmerApplyData-organisation', () => {
    const expectedTransformedJsonExample1 = '123456,789123456,farmerApplyData-organisation,Session set for farmerApplyData and organisation.,TEMP-1234-ABCD,,123456,Farmer Brown,Brown Cow Farm,brown@test.com.test,,brown@test.com.test,2024-02-15T13:23:57.287Z,,,,,,,,,,,,,,,,'
    expect(result).toContain(expectedTransformedJsonExample1)
  })

  test('csv content includes sample data from event - ineligibility-event', () => {
    const expectedTransformedJsonExample2 = '123456,789123456,ineligibility-event,Apply: LockedBusinessError,TEMP-1234-ABCD,,,,,,,brown@test.com.test,2024-02-15T13:23:40.068Z,apply,,,,,,,,,,,,,,,'
    expect(result).toContain(expectedTransformedJsonExample2)
  })

  test('csv content includes sample data from event - endemicsClaim-organisation', () => {
    const expectedTransformedJsonExample3 = '123456,789123456,endemicsClaim-organisation,Session set for endemicsClaim and organisation.,,,123456,Farmer Brown,Brown Cow Farm,brown@test.com.test,Yorkshire Moors  AB1 1AB  United Kingdom,brown@test.com.test,2024-03-05T15:57:39.590Z,,,,,,,,,,,,,,,,'
    expect(result).toContain(expectedTransformedJsonExample3)
  })

  test('csv content includes sample data from event - farmerApplyData-declaration', () => {
    const expectedTransformedJsonExample3 = '123456,789123456,farmerApplyData-declaration,Session set for farmerApplyData and declaration.,TEMP-1234-ABCD,,,,,,,brown@test.com.test,2024-01-04T21:27:23.530Z,,,,true,,,,,,,,,,,,'
    expect(result).toContain(expectedTransformedJsonExample3)
  })

  test('csv content includes sample data from event - claim-vetName', () => {
    const expectedTransformedJsonExample4 = '123456,789123456,claim-vetName,Session set for claim and vetName.,TEMP-1234-ABCD,,,,,,,brown@test.com.test,2024-01-04T21:27:23.530Z,,,,,,,,,Freda George,,,,,,,'
    expect(result).toContain(expectedTransformedJsonExample4)
  })

  test('csv content includes sample data from event - application:status-updated:12 originating from subStatus', () => {
    const expectedTransformedJsonExample4 = '123456,789123456,application:status-updated:12,New stage execution has been created,AHWR-04DC-5073,,,,,,,someuser@email.com,2024-01-19T15:32:07.574Z,,,,,,,,,,,,,,12,RECOMMENDED TO PAY,'
    expect(result).toContain(expectedTransformedJsonExample4)
  })

  test('csv content includes sample data from event - application:status-updated:13 originating from subStatus', () => {
    const expectedTransformedJsonExample4 = '123456,789123456,application:status-updated:13,New stage execution has been created,AHWR-04DC-5073,,,,,,,someuser@email.com,2024-01-19T15:32:07.574Z,,,,,,,,,,,,,,13,RECOMMENDED TO REJECT,'
    expect(result).toContain(expectedTransformedJsonExample4)
  })
})

describe('partition Key is transformed to 9 characters for sbi', () => {
  test('csv content includes correct sbi from event partition key when exactly 9 characters', () => {
    events[0].partitionKey = '123456789'
    result = transformJsonToCsv(events)

    expect(result).toContain('123456789')
  })

  test('csv content includes correct sbi from event partition key when more than 9 characters', () => {
    events[0].partitionKey = '12345678999999'
    result = transformJsonToCsv(events)
    console.log('result', result)

    expect(result).toContain('123456789')
    expect(result).not.toContain('12345678999999')
  })
})
