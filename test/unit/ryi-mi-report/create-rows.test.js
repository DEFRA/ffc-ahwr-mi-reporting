const createRows = require('../../../ffc-ahwr-mi-reporting/ryi-mi-report/create-rows')

describe('createRows', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  test.each([
    {
      toString: () => 'Register your interest MI Report',
      given: {
        events: [
          {
            etag: 'W/"datetime\'2023-05-08T10%3A31%3A45.3368258Z\'"',
            partitionKey: 'm.mogiela@kainos.com',
            rowKey: 'm.mogiela@kainos.com_1683541903294',
            timestamp: '2023-05-08T10:31:45.3368258Z',
            EventId: 'm.mogiela@kainos.com',
            EventType: 'registration_of_interest',
            Status: 'success',
            Payload: '{' +
                  '  "businessEmail": "m.mogiela@kainos.com",' +
                  '  "createdAt": "2023-05-08T10:31:43.289Z",' +
                  '  "accessGranted": false,' +
                  '  "accessGrantedAt": "n/a"' +
                  '}',
            ChangedBy: 'm.mogiela@kainos.com',
            ChangedOn: '2023-05-08T10:31:43.294Z'
          },
          {
            etag: 'W/"datetime\'2023-05-08T10%3A32%3A02.5990399Z\'"',
            partitionKey: 'm.mogiela@kainos.com',
            rowKey: 'm.mogiela@kainos.com_1683541920750',
            timestamp: '2023-05-08T10:32:02.5990399Z',
            EventId: 'm.mogiela@kainos.com',
            EventType: 'gained_access_to_the_apply_journey',
            Status: 'success',
            Payload: '{' +
                  '  "businessEmail": "m.mogiela@kainos.com",' +
                  '  "createdAt": "2023-05-08T10:31:43.244Z",' +
                  '  "accessGranted": true,' +
                  '  "accessGrantedAt": "2023-05-08T10:32:00.148Z"' +
                  '}',
            ChangedBy: 'm.mogiela@kainos.com',
            ChangedOn: '2023-05-08T10:32:00.750Z'
          },
          {
            etag: 'W/"datetime\'2023-05-08T10%3A32%3A58.5544545Z\'"',
            partitionKey: 'm.mogiela@kainos.com',
            rowKey: 'm.mogiela@kainos.com_1683541976846',
            timestamp: '2023-05-08T10:32:58.5544545Z',
            EventId: 'm.mogiela@kainos.com',
            EventType: 'duplicate_submission',
            Status: 'success',
            Payload: '{' +
                  '  "businessEmail": "m.mogiela@kainos.com",' +
                  '  "createdAt": "2023-05-08T10:32:56.843Z",' +
                  '  "accessGranted": true,' +
                  '  "accessGrantedAt": "2023-05-08T10:32:00.148Z"' +
                  '}',
            ChangedBy: 'm.mogiela@kainos.com',
            ChangedOn: '2023-05-08T10:32:56.846Z'
          },
          {
            etag: 'W/"datetime\'2023-05-08T10%3A33%3A24.8227379Z\'"',
            partitionKey: 'm.mogiela@kainos.com',
            rowKey: 'm.mogiela@kainos.com_1683542003152',
            timestamp: '2023-05-08T10:33:24.8227379Z',
            EventId: 'm.mogiela@kainos.com',
            EventType: 'duplicate_submission',
            Status: 'success',
            Payload: '{' +
                  '  "businessEmail": "m.mogiela@kainos.com",' +
                  '  "createdAt": "2023-05-08T10:33:23.149Z",' +
                  '  "accessGranted": true,' +
                  '  "accessGrantedAt": "2023-05-08T10:32:00.148Z"' +
                  '}',
            ChangedBy: 'm.mogiela@kainos.com',
            ChangedOn: '2023-05-08T10:33:23.152Z'
          },
          {
            etag: 'W/"datetime\'2023-05-05T15%3A22%3A50.7228185Z\'"',
            partitionKey: 'marcinmo@kainos.com',
            rowKey: 'marcinmo@kainos.com_1683297421261',
            timestamp: '2023-05-05T15:22:50.7228185Z',
            EventId: 'marcinmo@kainos.com',
            EventType: 'gained_access_to_the_apply_journey',
            Status: 'success',
            Payload: '{' +
                  '  "businessEmail": "marcinmo@kainos.com",' +
                  '  "createdAt": "2023-05-05T14:24:24.543Z",' +
                  '  "accessGranted": true,' +
                  '  "accessGrantedAt": "2023-05-05T14:37:00.623Z"' +
                  '}',
            ChangedBy: 'marcinmo@kainos.com',
            ChangedOn: '2023-05-05T14:37:01.261Z'
          },
          {
            etag: 'W/"datetime\'2023-05-08T10%3A29%3A38.9234438Z\'"',
            partitionKey: 'marcinmo@kainos.com',
            rowKey: 'marcinmo@kainos.com_1683541776419',
            timestamp: '2023-05-08T10:29:38.9234438Z',
            EventId: 'marcinmo@kainos.com',
            EventType: 'duplicate_submission',
            Status: 'success',
            Payload: '{' +
                  '  "businessEmail": "marcinmo@kainos.com",' +
                  '  "createdAt": "2023-05-08T10:29:36.412Z",' +
                  '  "accessGranted": true,' +
                  '  "accessGrantedAt": "2023-05-05T15:18:00.383Z"' +
                  '}',
            ChangedBy: 'marcinmo@kainos.com',
            ChangedOn: '2023-05-08T10:29:36.419Z'
          },
          {
            etag: 'W/"datetime\'2023-05-03T10%3A00%3A45.3368258Z\'"',
            partitionKey: 'marcinmo@kainos.com',
            rowKey: 'marcinmo@kainos.com_1683541903294',
            timestamp: '2023-05-03T10:00:45.3368258Z',
            EventId: 'marcinmo@kainos.com',
            EventType: 'registration_of_interest',
            Status: 'success',
            Payload: '{' +
                  '  "businessEmail": "marcinmo@kainos.com",' +
                  '  "createdAt": "2023-05-03T10:00:43.289Z",' +
                  '  "accessGranted": false,' +
                  '  "accessGrantedAt": "n/a"' +
                  '}',
            ChangedBy: 'marcinmo@kainos.com',
            ChangedOn: '2023-05-03T10:00:43.294Z'
          }
        ]
      },
      expect: {
        rows: [
          {
            businessEmail: 'm.mogiela@kainos.com',
            eligibility: 'no',
            ineligibleReason: 'duplicate submission',
            interestRegisteredAt: '08/05/2023 10:33',
            accessGranted: 'no',
            accessGrantedAt: 'n/a'
          },
          {
            businessEmail: 'm.mogiela@kainos.com',
            eligibility: 'no',
            ineligibleReason: 'duplicate submission',
            interestRegisteredAt: '08/05/2023 10:32',
            accessGranted: 'no',
            accessGrantedAt: 'n/a'
          },
          {
            businessEmail: 'm.mogiela@kainos.com',
            interestRegisteredAt: '08/05/2023 10:31',
            eligibility: 'yes',
            ineligibleReason: 'n/a',
            accessGranted: 'yes',
            accessGrantedAt: '08/05/2023 10:32'
          },
          {
            businessEmail: 'marcinmo@kainos.com',
            interestRegisteredAt: '08/05/2023 10:29',
            eligibility: 'no',
            ineligibleReason: 'duplicate submission',
            accessGranted: 'no',
            accessGrantedAt: 'n/a'
          },
          {
            businessEmail: 'marcinmo@kainos.com',
            interestRegisteredAt: '03/05/2023 10:00',
            eligibility: 'yes',
            ineligibleReason: 'n/a',
            accessGranted: 'yes',
            accessGrantedAt: '05/05/2023 14:37'
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
