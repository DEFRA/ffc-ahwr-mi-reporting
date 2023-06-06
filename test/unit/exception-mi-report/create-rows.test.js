const createRows = require('../../../ffc-ahwr-mi-reporting/ineligibility-mi-report/create-rows')

describe('createRows', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  test.each([
    {
      toString: () => 'Ineligibility MI Report',
      given: {
        events: [
          {
            etag: 'W/"datetime\'2023-05-08T10%3A31%3A45.3368258Z\'"',
            partitionKey: '12345678',
            rowKey: '12345678_1683541903294',
            timestamp: '2023-05-08T10:31:45.3368258Z',
            EventId: 'sessionID',
            EventType: 'ineligibility-event',
            Status: 'alert',
            Payload: '{' +
                  '  "sbi": "12345678",' +
                  '  "crn": 12345678,' +
                  '  "exception": "Test Exception",' +
                  '  "raisedAt": "2023-05-08T10:31:43.244Z",' +
                  '  "journey": "apply"' +
                  '}',
            ChangedBy: 'm.mogiela@kainos.com',
            ChangedOn: '2023-05-08T10:31:43.294Z'
          },
          {
            etag: 'W/"datetime\'2023-05-08T10%3A32%3A02.5990399Z\'"',
            partitionKey: '12345678',
            rowKey: '12345678_1683541920750',
            timestamp: '2023-05-08T10:32:02.5990399Z',
            EventId: 'sessionID',
            EventType: 'ineligibility-event',
            Status: 'alert',
            Payload: '{' +
                  '  "sbi": "12345678",' +
                  '  "crn": 12345678,' +
                  '  "exception": "Test Exception",' +
                  '  "raisedAt": "2023-05-08T10:31:43.244Z",' +
                  '  "journey": "claim"' +
                  '}',
            ChangedBy: 'm.mogiela@kainos.com',
            ChangedOn: '2023-05-08T10:32:00.750Z'
          },
          {
            etag: 'W/"datetime\'2023-05-08T10%3A32%3A58.5544545Z\'"',
            partitionKey: '12345678',
            rowKey: '12345678_1683541976846',
            timestamp: '2023-05-08T10:32:58.5544545Z',
            EventId: 'sessionID',
            EventType: 'duplicate_submission',
            Status: 'alert',
            Payload: '{' +
                  '  "sbi": "12345678",' +
                  '  "crn": 12345678,' +
                  '  "exception": "Test Exception",' +
                  '  "raisedAt": "2023-05-08T10:31:43.244Z",' +
                  '  "journey": "claim"' +
                  '}',
            ChangedBy: 'm.mogiela@kainos.com',
            ChangedOn: '2023-05-08T10:32:56.846Z'
          }
        ]
      },
      expect: {
        rows: [
          {
            crn: 12345678,
            raisedAt: '08/05/2023 10:31',
            ineligibilityReason: 'Test Exception',
            journey: 'apply',
            sbi: '12345678'
          },
          {
            crn: 12345678,
            raisedAt: '08/05/2023 10:31',
            ineligibilityReason: 'Test Exception',
            journey: 'claim',
            sbi: '12345678'
          }
        ]
      }
    },
    {
      toString: () => 'given no events',
      given: {
        events: []
      },
      expect: {
        rows: []
      }
    }
  ])('%s', async (testCase) => {
    const rows = createRows(testCase.given.events)
    expect(rows).toEqual(testCase.expect.rows)
  })
})
