const config = require('../../../ffc-ahwr-mi-reporting/feature-toggle/config')
const { transformEventToCsvV3 } = require('../../../ffc-ahwr-mi-reporting/mi-report-v3/transformJsonToCsvV3')
const mockContext = require('../../mock/mock-context')

jest.mock('@azure/storage-blob')
jest.mock('fs')

const consoleSpy = jest
  .spyOn(mockContext.log, 'error')

describe('transformEventToCsvV3', () => {
  beforeEach(() => {
    config.flagReporting.enabled = false
  })

  afterEach(() => {
    consoleSpy.mockReset()
  })

  test('returns undefined when no event provided', async () => {
    const result = await transformEventToCsvV3(undefined, mockContext)

    expect(consoleSpy).toHaveBeenCalledWith('No event provided')
    expect(result).toBe(undefined)
  })

  test('returns csv row when event provided', async () => {
    const event = {
      partitionKey: '123456',
      SessionId: '789123456',
      EventType: 'farmerApplyData-organisation',
      EventRaised: new Date().toISOString(),
      Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"reference":"TEMP-1234-ABCD","organisation":{"sbi":"123456","farmerName":"Farmer Brown","name":"Brown Cow Farm","email":"brown@test.com.test","orgEmail":"brownorg@test.com.test","address":"Yorkshire Moors,AB1 1AB,United Kingdom","crn":"0123456789","frn":"9876543210"}},"raisedBy":"brown@test.com.test","raisedOn":"2024-02-15T13:23:57.287Z"}'
    }

    const result = await transformEventToCsvV3(event, mockContext)

    expect(result).toBe('123456,789123456,farmerApplyData-organisation,Session set for farmerApplyData and organisation.,TEMP-1234-ABCD,,,,,123456,0123456789,9876543210,Farmer Brown,Brown Cow Farm,brown@test.com.test,brownorg@test.com.test,Yorkshire Moors AB1 1AB United Kingdom,brown@test.com.test,2024-02-15T13:23:57.287Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,')
  })

  test('returns csv row with empty flag data when event provided and flag reporting feature flag is enabled', async () => {
    config.flagReporting.enabled = true
    const event = {
      partitionKey: '123456',
      SessionId: '789123456',
      EventType: 'farmerApplyData-organisation',
      EventRaised: new Date().toISOString(),
      Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"reference":"TEMP-1234-ABCD","organisation":{"sbi":"123456","farmerName":"Farmer Brown","name":"Brown Cow Farm","email":"brown@test.com.test","orgEmail":"brownorg@test.com.test","address":"Yorkshire Moors,AB1 1AB,United Kingdom","crn":"0123456789","frn":"9876543210"}},"raisedBy":"brown@test.com.test","raisedOn":"2024-02-15T13:23:57.287Z"}'
    }

    const result = await transformEventToCsvV3(event, mockContext)

    expect(result).toBe('123456,789123456,farmerApplyData-organisation,Session set for farmerApplyData and organisation.,TEMP-1234-ABCD,,,,,123456,0123456789,9876543210,Farmer Brown,Brown Cow Farm,brown@test.com.test,brownorg@test.com.test,Yorkshire Moors AB1 1AB United Kingdom,brown@test.com.test,2024-02-15T13:23:57.287Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,')
  })

  test('returns undefined when event contains invalid JSON in Payload field', async () => {
    const event = {
      partitionKey: '123456',
      SessionId: '789123456',
      EventType: 'farmerApplyData-organisation',
      EventRaised: new Date().toISOString(),
      Payload: ''
    }

    const result = await transformEventToCsvV3(event, mockContext)

    expect(consoleSpy).toHaveBeenCalledWith('Parse event error', expect.anything(), expect.anything())
    expect(result).toBe(undefined)
  })

  test('returns csv row when event isInCheckWithSubStatus', async () => {
    const event = {
      partitionKey: '123456',
      SessionId: '789123456',
      EventRaised: new Date().toISOString(),
      EventType: 'application:status-updated:5',
      Payload: '{"type":"application:status-updated:5","message":"New stage execution has been created","data":{"reference":"AHWR-04DC-5073","statusId":5,"subStatus":"Recommend to pay"},"raisedBy":"someuser@email.com","raisedOn":"2024-01-19T15:32:07.574Z","timestamp":"2024-01-19T15:32:07.616Z"}'
    }

    const result = await transformEventToCsvV3(event, mockContext)

    expect(result).toBe('123456,789123456,application:status-updated:12,New stage execution has been created,AHWR-04DC-5073,,,,,,,,,,,,,someuser@email.com,2024-01-19T15:32:07.574Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,12,RECOMMENDED TO PAY,')
  })

  describe('temp reference events', () => {
    test('Csv row does not contain temp reference when malformed key present', async () => {
      const event = {
        partitionKey: '123456',
        SessionId: '789123456',
        EventRaised: new Date().toISOString(),
        EventType: 'tempReference-[object Object]',
        Payload: '{"type":"tempReference-[object Object]","message":"Session set for tempReference and [object Object].","data":{"reference":"IAHW-K9XY-SGYI","[object Object]":"TEMP-K9XY-SGYI","ip":"40.81.156.55"},"raisedBy":"nobody@noone.com.test","raisedOn":"2025-02-11T11:44:41.319Z"}'
      }

      const resultAsColVals = await transformEventToCsvV3(event, mockContext).split(',')

      const eventTypeValue = resultAsColVals[2]
      const messageValue = resultAsColVals[3]
      const concreteRefValue = resultAsColVals[4]
      const tempRefValue = resultAsColVals[6]

      expect(eventTypeValue).toBe('tempReference-[object Object]')
      expect(messageValue).toBe('Session set for tempReference and [object Object].')
      expect(concreteRefValue).toBe('IAHW-K9XY-SGYI')
      expect(tempRefValue).toBe('')
    })

    test('Csv row contains temp reference when correct key present', async () => {
      const event = {
        partitionKey: '123456',
        SessionId: '789123456',
        EventRaised: new Date().toISOString(),
        EventType: 'tempReference-tempReference',
        Payload: '{"type":"tempReference-tempReference","message":"Session set for tempReference and tempReference.","data":{"reference":"IAHW-K9XY-SGYI","tempReference":"TEMP-K9XY-SGYI","ip":"40.81.156.55"},"raisedBy":"nobody@noone.com.test","raisedOn":"2025-02-11T11:44:41.319Z"}'
      }

      const resultAsColVals = await transformEventToCsvV3(event, mockContext).split(',')

      const eventTypeValue = resultAsColVals[2]
      const messageValue = resultAsColVals[3]
      const concreteRefValue = resultAsColVals[4]
      const tempRefValue = resultAsColVals[6]

      expect(eventTypeValue).toBe('tempReference-tempReference')
      expect(messageValue).toBe('Session set for tempReference and tempReference.')
      expect(concreteRefValue).toBe('IAHW-K9XY-SGYI')
      expect(tempRefValue).toBe('TEMP-K9XY-SGYI')
    })
  })

  test('returns csv row with flag reporting data when flag reporting feature flag is enabled', async () => {
    config.flagReporting.enabled = true
    const event = {
      partitionKey: '123456',
      SessionId: '789123456',
      EventType: 'application:flagged',
      EventRaised: new Date().toISOString(),
      Payload: JSON.stringify({
        type: 'application:flagged',
        message: 'Application flagged',
        data: {
          flagId: 'b6b76548-bd6e-45b3-b137-05d930004c9b',
          flagDetail: 'Declined multi herds agreement',
          flagAppliesToMh: true
        },
        raisedBy: 'Jane Doe',
        raisedOn: '2025-03-28T12:06:37.489Z'
      })
    }

    const result = await transformEventToCsvV3(event, mockContext)

    expect(result).toBe('123456,789123456,application:flagged,Application flagged,,,,,,,,,,,,,,Jane Doe,2025-03-28T12:06:37.489Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,b6b76548-bd6e-45b3-b137-05d930004c9b,Declined multi herds agreement,true')
  })
})
