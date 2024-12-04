const { transformEventToCsvV3 } = require('../../../ffc-ahwr-mi-reporting/mi-report-v3/transformJsonToCsvV3')
const mockContext = require('../../mock/mock-context')

jest.mock('@azure/storage-blob')
jest.mock('fs')

const consoleSpy = jest
  .spyOn(mockContext, 'error')

let result

describe('transformEventToCsvV3', () => {
  afterEach(() => {
    consoleSpy.mockReset()
  })

  test('returns undefined when no event provided', async () => {
    result = await transformEventToCsvV3(undefined, mockContext)

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

    result = await transformEventToCsvV3(event, mockContext)

    expect(result).toBe('123456,789123456,farmerApplyData-organisation,Session set for farmerApplyData and organisation.,TEMP-1234-ABCD,,,,,123456,0123456789,9876543210,Farmer Brown,Brown Cow Farm,brown@test.com.test,brownorg@test.com.test,Yorkshire Moors AB1 1AB United Kingdom,brown@test.com.test,2024-02-15T13:23:57.287Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,')
  })

  test('returns undefined when event contains invalid JSON in Payload field', async () => {
    const event = {
      partitionKey: '123456',
      SessionId: '789123456',
      EventType: 'farmerApplyData-organisation',
      EventRaised: new Date().toISOString(),
      Payload: ''
    }

    result = await transformEventToCsvV3(event, mockContext)

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

    result = await transformEventToCsvV3(event, mockContext)

    expect(result).toBe('123456,789123456,application:status-updated:12,New stage execution has been created,AHWR-04DC-5073,,,,,,,,,,,,,someuser@email.com,2024-01-19T15:32:07.574Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,12,RECOMMENDED TO PAY,')
  })
})
