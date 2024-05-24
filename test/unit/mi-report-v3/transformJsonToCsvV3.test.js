const transformJsonToCsvV3 = require('../../../ffc-ahwr-mi-reporting/mi-report-v3/transformJsonToCsvV3')

const events = [{
  partitionKey: '123456',
  SessionId: '789123456',
  EventType: 'farmerApplyData-organisation',
  EventRaised: new Date().toISOString(),
  Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"reference":"TEMP-1234-ABCD","organisation":{"sbi":"123456","farmerName":"Farmer Brown","name":"Brown Cow Farm","email":"brown@test.com.test","orgEmail":"brownorg@test.com.test","address":"Yorkshire Moors,AB1 1AB,United Kingdom","crn":"0123456789","frn":"9876543210"}},"raisedBy":"brown@test.com.test","raisedOn":"2024-02-15T13:23:57.287Z"}'
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
  EventType: 'claim-organisation',
  //        {"type":"claim-organisation","message":"Session set for claim and organisation.","data":{"reference":"FUSH-035A-E8E9","organisation":{"sbi":"107267101","farmerName":"William Bonds","name":"Mrs Sally Pluck","email":"williambondsp@sdnobmailliwe.com.test","orgEmail":"mrssallypluckc@kculpyllassrmz.com.test","address":"Coquet Nook Farm,Shelsley Beauchamp,Avening,21,MOSS VILLA,BURGH HILL,MILTON KEYNES,LA8 8BU,United Kingdom","crn":"1100625992"}},"raisedBy":"williambondsp@sdnobmailliwe.com.test","raisedOn":"2024-05-23T22:50:15.227Z"}
  Payload: '{"type":"claim-organisation","message":"Session set for claim and organisation.","data":{"reference":"TEMP-1234-ABCD","organisation":{"sbi":"123456","farmerName":"Farmer Brown","name":"Brown Cow Farm","email":"brown@test.com.test","orgEmail":"brownorg@test.com.test","address":"Yorkshire Moors,AB1 1AB,United Kingdom","crn":"0123456789","frn":"9876543210"}},"raisedBy":"brown@test.com.test","raisedOn":"2024-03-05T15:57:39.590Z"}'
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
}
]

const consoleSpy = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {})

let result

test('no events found', () => {
  const noEvents = []
  result = transformJsonToCsvV3(noEvents)

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
    expect(data).toMatchObject({ organisation: { address: 'Yorkshire Moors,AB1 1AB,United Kingdom', email: 'brown@test.com.test', farmerName: 'Farmer Brown', name: 'Brown Cow Farm', sbi: '123456', crn: '0123456789', frn: '9876543210' }, reference: 'TEMP-1234-ABCD' })
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
    result = transformJsonToCsvV3(testEvents)

    expect(consoleSpy).toHaveBeenCalledTimes(1)
    expect(consoleSpy.mock.calls.flat().toString()).toContain('Parse event error')

    consoleSpy.mockReset()
  })
})

describe('events are transformed to remove json structure', () => {
  beforeEach(() => {
    result = transformJsonToCsvV3(events)
  })

  test('csv content includes header row', () => {
    const expectedTransformedJsonHeader =
    'sbiFromPartitionKey,sessionId,eventType,message,reference,tempApplicationReference,tempClaimReference,typeOfClaim,sbiFromPayload,crn,frn,farmerName,organisationName,userEmail,orgEmail,address,raisedBy,raisedOn,journey,confirmCheckDetails,eligibleSpecies,agreeSameSpecies,agreeSpeciesNumbers,agreeVisitTimings,declaration,offerStatus,species,detailsCorrect,typeOfLivestock,visitDate,dateOfSampling,vetName,vetRcvs,urnReference,herdVaccinationStatus,numberOfOralFluidSamples,numberOfSamplesTested,numberAnimalsTested,testResults,vetVisitsReviewTestResults,sheepEndemicsPackage,piHunt,biosecurity,biosecurityAssessmentPercentage,diseaseStatus,latestEndemicsApplication,latestVetVisitApplication,relevantReviewForEndemics,claimed,exception,statusId,statusName,eventStatus'
    expect(result).toContain(expectedTransformedJsonHeader)
  })

  test('csv content includes sample data from event - farmerApplyData-organisation', () => {
    const expectedTransformedJsonExample1 = '123456,789123456,farmerApplyData-organisation,Session set for farmerApplyData and organisation.,TEMP-1234-ABCD,,,,123456,0123456789,9876543210,Farmer Brown,Brown Cow Farm,brown@test.com.test,brownorg@test.com.test,Yorkshire Moors AB1 1AB United Kingdom,brown@test.com.test,2024-02-15T13:23:57.287Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,'
    expect(result).toContain(expectedTransformedJsonExample1)
  })

  test('csv content includes sample data from event - ineligibility-event', () => {
    const expectedTransformedJsonExample2 = '123456,789123456,ineligibility-event,Apply: LockedBusinessError,TEMP-1234-ABCD,,,,,,,,,,,,brown@test.com.test,2024-02-15T13:23:40.068Z,apply,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,LockedBusinessError,,,'
    expect(result).toContain(expectedTransformedJsonExample2)
  })

  test('csv content includes sample data from event - claim-organisation', () => {
    const expectedTransformedJsonExample3 = '123456,789123456,claim-organisation,Session set for claim and organisation.,TEMP-1234-ABCD,,,,123456,0123456789,9876543210,Farmer Brown,Brown Cow Farm,brown@test.com.test,brownorg@test.com.test,Yorkshire Moors AB1 1AB United Kingdom,brown@test.com.test,2024-03-05T15:57:39.590Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,'
    expect(result).toContain(expectedTransformedJsonExample3)
  })

  test('csv content includes sample data from event - farmerApplyData-declaration', () => {
    const expectedTransformedJsonExample3 = '123456,789123456,farmerApplyData-declaration,Session set for farmerApplyData and declaration.,TEMP-1234-ABCD,,,,,,,,,,,,brown@test.com.test,2024-01-04T21:27:23.530Z,,,,,,,true,,,,,,,,,,,,,,,,,,,,,,,,,,,,'
    expect(result).toContain(expectedTransformedJsonExample3)
  })

  test('csv content includes sample data from event - claim-vetName', () => {
    const expectedTransformedJsonExample4 = '123456,789123456,claim-vetName,Session set for claim and vetName.,TEMP-1234-ABCD,,,,,,,,,,,,brown@test.com.test,2024-01-04T21:27:23.530Z,,,,,,,,,,,,,,Freda George,,,,,,,,,,,,,,,,,,,,,'
    expect(result).toContain(expectedTransformedJsonExample4)
  })
})

describe('partition Key is transformed to 9 characters for sbi', () => {
  test('csv content includes correct sbi from event partition key when exactly 9 characters', () => {
    events[0].partitionKey = '123456789'
    result = transformJsonToCsvV3(events)

    expect(result).toContain('123456789')
  })

  test('csv content includes correct sbi from event partition key when more than 9 characters', () => {
    events[0].partitionKey = '12345678999999'
    result = transformJsonToCsvV3(events)
    console.log('result', result)

    expect(result).toContain('123456789')
    expect(result).not.toContain('12345678999999')
  })
})
