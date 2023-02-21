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
      toString: () => 'empty events',
      given: {
        events: []
      },
      expect: {
        parsedEvents: []
      }
    },
    {
      toString: () => 'one event',
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
                    "eligible":true,"ineligibleReason":"n/a",
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
    }
  ])('%s', async (testCase) => {
    const parsedEvents = parseEvents(testCase.given.events)
    expect(parsedEvents).toEqual(testCase.expect.parsedEvents)
  })
})
