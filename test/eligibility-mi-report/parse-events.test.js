const parseEvents = require('../../ffc-ahwr-mi-reporting/eligibility-mi-report/parse-events')

const MOCK_NOW = new Date()

describe('Parse Events', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  test.each([
    {
      toString: () => 'single "gained_access_to_the_apply_journey" event',
      given: {
        events: [
          {
            partitionKey: '108675109',
            rowKey: '108675109_1676982721348',
            timestamp: '2023-02-21T12:32:02.7997952Z',
            SessionId: '108675109_1103314955',
            EventType: 'gained_access_to_the_apply_journey',
            EventRaised: '2023-02-21T12:32:01.348Z',
            EventBy: 'business2@email.com',
            Payload: `{
                "type":"gained_access_to_the_apply_journey",
                "message":"The user has gained access to the apply journey",
                "data":{
                    "crn":"1103314955",
                    "sbi":"108675109",
                    "businessEmail":"business2@email.com",
                    "onWaitingList":false,
                    "waitingUpdatedAt":"2023-02-21T12:31:51.354Z",
                    "eligible":true,
                    "ineligibleReason":"n/a",
                    "accessGranted":true,
                    "accessGrantedAt":"2023-02-21T12:32:00.765Z"
                },
                "raisedBy":"business2@email.com",
                "raisedOn":"2023-02-21T12:32:01.348Z"
            }`,
            Status: 'success'
          }
        ]
      },
      expect: {
        parsedEvents: [
          {
            sbi: '108675109',
            crn: '1103314955',
            businessEmail: 'business2@email.com',
            eligible: true,
            ineligibleReason: 'n/a',
            onWaitingList: 'FALSE',
            registrationOfInterestTimestamp: '2023-02-21T12:31:51.354Z',
            accessGranted: true,
            accessGrantedTimestamp: '2023-02-21T12:32:00.765Z'
          }
        ]
      }
    },
    {
      toString: () => 'both "registration_of_interest" and "gained_access_to_the_apply_journey" events',
      given: {
        events: [
          {
            partitionKey: '105000061',
            rowKey: '105000061_1676921932072',
            timestamp: '2023-02-21T10:26:13.6534925Z',
            EventBy: '105000061@email.com',
            EventRaised: '2023-02-20T19:38:52.072Z',
            EventType: 'registration_of_interest',
            Payload: `{
                "type":"registration_of_interest",
                "message":"The customer has been put on the waiting list",
                "data":{
                    "sbi":"105000061",
                    "crn":"1100000077",
                    "businessEmail":"105000061@email.com",
                    "interestRegisteredAt":"2023-02-20T19:38:52.061Z",
                    "eligible":true,
                    "ineligibleReason":"n/a",
                    "onWaitingList":true,
                    "waitingUpdatedAt":"2023-02-20T19:38:52.061Z",
                    "accessGranted":false,
                    "accessGrantedAt":"n/a"
                },
                "raisedBy":"105000061@email.com",
                "raisedOn":"2023-02-20T19:38:52.072Z"
            }`,
            SessionId: '105000061_1100000077',
            Status: 'success'
          },
          {
            partitionKey: '105000061',
            rowKey: '105000061_1676922001026',
            timestamp: '2023-02-20T19:40:01.8461873Z',
            SessionId: '105000061_1100000077',
            EventType: 'gained_access_to_the_apply_journey',
            EventRaised: '2023-02-20T19:40:01.026Z',
            EventBy: '105000061@email.com',
            Payload: `{
                "type":"gained_access_to_the_apply_journey",
                "message":"The user has gained access to the apply journey",
                "data":{
                    "crn":"1100000077",
                    "sbi":"105000061",
                    "businessEmail":"105000061@email.com",
                    "onWaitingList":false,
                    "waitingUpdatedAt":"2023-02-20T19:38:51.416Z",
                    "eligible":true,
                    "ineligibleReason":"n/a",
                    "accessGranted":true,
                    "accessGrantedAt":"2023-02-20T19:40:00.405Z"
                },
                "raisedBy":"105000061@email.com",
                "raisedOn":"2023-02-20T19:40:01.026Z"
            }`,
            Status: 'success'
          }
        ]
      },
      expect: {
        parsedEvents: [
          {
            sbi: '105000061',
            crn: '1100000077',
            businessEmail: '105000061@email.com',
            eligible: true,
            ineligibleReason: 'n/a',
            onWaitingList: 'FALSE',
            registrationOfInterestTimestamp: '2023-02-20T19:38:52.061Z',
            accessGranted: true,
            accessGrantedTimestamp: '2023-02-20T19:40:00.405Z'
          }
        ]
      }
    },
    {
      toString: () => 'no events',
      given: {
        events: []
      },
      expect: {
        parsedEvents: []
      }
    }
  ])('%s', async (testCase) => {
    const parsedEvents = parseEvents(testCase.given.events)
    expect(parsedEvents).toEqual(testCase.expect.parsedEvents)
  })
})
