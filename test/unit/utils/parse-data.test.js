const moment = require('moment')
const { formatDate, parseData, parsePayload } = require('../../../ffc-ahwr-mi-reporting/utils/parse-data')

describe('formatDate(date)', () => {
  test.each([
    {
      toString: () => 'given a date it formats it to DD/MM/YYYY HH:mm',
      given: {
        date: new Date('2023-02-23T10:20:18.352Z')
      },
      when: {
        format: undefined
      },
      expect: {
        formattedDate: '23/02/2023 10:20'
      }
    },
    {
      toString: () => 'given an ISO date it formats it to DD/MM/YYYY HH:mm',
      given: {
        date: '2023-02-23T10:20:18.352Z'
      },
      when: {
        format: moment.ISO_8601
      },
      expect: {
        formattedDate: '23/02/2023 10:20'
      }
    }
  ])('%s', async (testCase) => {
    expect(
      formatDate(testCase.given.date, testCase.when.format)
    ).toEqual(testCase.expect.formattedDate)
  })
})

describe('parseData', () => {
  const events = [{
    partitionKey: '123456',
    SessionId: '789123456',
    EventType: 'farmerApplyData-organisation',
    EventRaised: new Date().toISOString(),
    Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"reference":"TEMP-1234-ABCD","organisation":{"sbi":"123456","farmerName":"Farmer Brown","name":"Brown Cow Farm","email":"brown@test.com.test","orgEmail":"brownorg@test.com.test","address":"Yorkshire Moors,AB1 1AB,United Kingdom","crn":"0123456789","frn":"9876543210"}},"raisedBy":"brown@test.com.test","raisedOn":"2024-02-15T13:23:57.287Z"}'
  },
  {
    partitionKey: '123456',
    SessionId: '789123456',
    EventRaised: new Date().toISOString(),
    EventType: 'claim-organisation',
    Payload: '{"type":"claim-organisation","message":"Session set for claim and organisation.","data":{"reference":"TEMP-1234-ABCD","applicationReference":"IAHW-1234-EFGH","organisation":{"sbi":"123456","farmerName":"Farmer Brown","name":"Brown Cow Farm","email":"brown@test.com.test","orgEmail":"brownorg@test.com.test","address":"Yorkshire Moors,AB1 1AB,United Kingdom","crn":"0123456789","frn":"9876543210"}},"raisedBy":"brown@test.com.test","raisedOn":"2024-03-05T15:57:39.590Z"}'
  },
  {
    partitionKey: '123456',
    SessionId: '789123456',
    EventRaised: new Date().toISOString(),
    EventType: 'farmerApplyData-declaration',
    Payload: '{"type":"farmerApplyData-declaration","message":"Session set for farmerApplyData and declaration.","data":{"reference":"TEMP-1234-ABCD","declaration":true},"raisedBy":"brown@test.com.test","raisedOn":"2024-01-04T21:27:23.530Z"}'
  }]

  test('test', () => {
    const result = parseData(events, 'farmerApplyData', 123456)

    console.log('::: ', result)
    expect(result).toBeTruthy()
  })

  test('test', () => {
    const result = parsePayload(events, 'farmerApplyData')

    console.log('::: ', result)
    expect(result).toBeTruthy()
  })
})
