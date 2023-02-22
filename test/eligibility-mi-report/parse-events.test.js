const parseEvents = require('../../ffc-ahwr-mi-reporting/eligibility-mi-report/parse-events')

describe('Parse Events', () => {
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
            registrationOfInterestTimestamp: '2023-02-21T12:31:51.354Z',
            eligible: true,
            ineligibleReason: 'n/a',
            onWaitingList: 'FALSE',
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
            registrationOfInterestTimestamp: '2023-02-20T19:38:52.061Z',
            eligible: true,
            ineligibleReason: 'n/a',
            onWaitingList: 'FALSE',
            accessGranted: true,
            accessGrantedTimestamp: '2023-02-20T19:40:00.405Z'
          }
        ]
      }
    },
    {
      toString: () => 'duplicate submissions',
      given: {
        events: [
          {
            partitionKey: '108675110',
            rowKey: '108675110_1676983040432',
            timestamp: '2023-02-21T12:37:21.7408863Z',
            SessionId: '108675110_1103314955',
            EventType: 'registration_of_interest',
            EventRaised: '2023-02-21T12:37:20.432Z',
            EventBy: 'business3@email.com',
            Payload: `{
              "type":"registration_of_interest",
              "message":"The customer has been put on the waiting list",
              "data":{
                "sbi":"108675110",
                "crn":"1103314955",
                "businessEmail":"business3@email.com",
                "interestRegisteredAt":"2023-02-21T12:37:20.426Z",
                "eligible":true,
                "ineligibleReason":"n/a",
                "onWaitingList":true,
                "waitingUpdatedAt":"2023-02-21T12:37:20.426Z",
                "accessGranted":false,
                "accessGrantedAt":"n/a"
              },
              "raisedBy":"business3@email.com",
              "raisedOn":"2023-02-21T12:37:20.432Z"
            }`,
            Status: 'success'
          },
          {
            partitionKey: '108675110',
            rowKey: '108675110_1676983081245',
            timestamp: '2023-02-21T12:38:02.5293187Z',
            SessionId: '108675110_1103314955',
            EventType: 'gained_access_to_the_apply_journey',
            EventRaised: '2023-02-21T12:38:01.245Z',
            EventBy: 'business3@email.com',
            Payload: `{
              "type":"gained_access_to_the_apply_journey",
              "message":"The user has gained access to the apply journey",
              "data":{
                "crn":"1103314955",
                "sbi":"108675110",
                "businessEmail":"business3@email.com",
                "onWaitingList":false,
                "waitingUpdatedAt":"2023-02-21T12:37:19.910Z",
                "eligible":true,
                "ineligibleReason":"n/a",
                "accessGranted":true,
                "accessGrantedAt":"2023-02-21T12:38:00.790Z"
              },
              "raisedBy":"business3@email.com",
              "raisedOn":"2023-02-21T12:38:01.245Z"
            }`,
            Status: 'success'
          },
          {
            partitionKey: '108675110',
            rowKey: '108675110_1676983319184',
            timestamp: '2023-02-21T12:42:00.5097017Z',
            SessionId: '108675110_1103314955',
            EventType: 'duplicate_submission',
            EventRaised: '2023-02-21T12:41:59.184Z',
            EventBy: 'business3@email.com',
            Payload: `{
                "type":"duplicate_submission",
                "message":"The customer has been recognised as ineligible",
                "data":{
                    "crn":"1103314955",
                    "sbi":"108675110",
                    "businessEmail":"business3@email.com",
                    "interestRegisteredAt":"2023-02-21T12:41:59.181Z",
                    "onWaitingList":false,
                    "waitingUpdatedAt":"n/a",
                    "eligible":false,
                    "ineligibleReason":"Duplicate submission",
                    "accessGranted":false,
                    "accessGrantedAt":"n/a"
                },
                "raisedBy":"business3@email.com",
                "raisedOn":"2023-02-21T12:41:59.184Z"
            }`,
            Status: 'success'
          },
          {
            partitionKey: '108675110',
            rowKey: '108675110_1676983319184',
            timestamp: '2023-02-22T12:42:00.5097017Z',
            SessionId: '108675110_1103314955',
            EventType: 'duplicate_submission',
            EventRaised: '2023-02-22T12:41:59.184Z',
            EventBy: 'business3@email.com',
            Payload: `{
                "type":"duplicate_submission",
                "message":"The customer has been recognised as ineligible",
                "data":{
                    "crn":"1103314955",
                    "sbi":"108675110",
                    "businessEmail":"business3@email.com",
                    "interestRegisteredAt":"2023-02-22T12:41:59.181Z",
                    "onWaitingList":false,
                    "waitingUpdatedAt":"n/a",
                    "eligible":false,
                    "ineligibleReason":"Duplicate submission",
                    "accessGranted":false,
                    "accessGrantedAt":"n/a"
                },
                "raisedBy":"business3@email.com",
                "raisedOn":"2023-02-22T12:41:59.184Z"
            }`,
            Status: 'success'
          }
        ]
      },
      expect: {
        parsedEvents: [
          {
            sbi: '108675110',
            crn: '1103314955',
            businessEmail: 'business3@email.com',
            registrationOfInterestTimestamp: '2023-02-21T12:37:20.426Z',
            eligible: true,
            ineligibleReason: 'n/a',
            onWaitingList: 'FALSE',
            accessGranted: true,
            accessGrantedTimestamp: '2023-02-21T12:38:00.790Z'
          },
          {
            sbi: '108675110',
            crn: '1103314955',
            businessEmail: 'business3@email.com',
            registrationOfInterestTimestamp: '2023-02-21T12:41:59.181Z',
            eligible: false,
            ineligibleReason: 'Duplicate submission',
            onWaitingList: 'FALSE',
            accessGranted: false,
            accessGrantedTimestamp: 'n/a'
          },
          {
            sbi: '108675110',
            crn: '1103314955',
            businessEmail: 'business3@email.com',
            registrationOfInterestTimestamp: '2023-02-22T12:41:59.181Z',
            eligible: false,
            ineligibleReason: 'Duplicate submission',
            onWaitingList: 'FALSE',
            accessGranted: false,
            accessGrantedTimestamp: 'n/a'
          }
        ]
      }
    },
    {
      toString: () => 'two "no_match" events',
      given: {
        events: [
          {
            partitionKey: '108675111',
            rowKey: '108675111_1677059013159',
            timestamp: '2023-02-22T09:43:34.6230164Z',
            SessionId: '108675111_1103314955',
            EventType: 'no_match',
            EventRaised: '2023-02-22T09:43:33.159Z',
            EventBy: 'business3@email.com',
            Payload: `{
              "type":"no_match",
              "message":"The customer has been recognised as ineligible",
              "data":{
                "sbi":"108675111",
                "crn":"1103314955",
                "businessEmail":"business3@email.com",
                "interestRegisteredAt":"2023-02-22T09:43:33.150Z",
                "onWaitingList":false,
                "waitingUpdatedAt":"n/a",
                "eligible":false,
                "ineligibleReason":"No match against data warehouse",
                "accessGranted":false,
                "accessGrantedAt":"n/a"
              },
              "raisedBy":"business3@email.com",
              "raisedOn":"2023-02-22T09:43:33.159Z"
            }`,
            Status: 'success'
          },
          {
            partitionKey: '108675111',
            rowKey: '108675111_1677059013159',
            timestamp: '2023-02-23T09:43:34.6230164Z',
            SessionId: '108675111_1103314955',
            EventType: 'no_match',
            EventRaised: '2023-02-23T09:43:33.159Z',
            EventBy: 'business3@email.com',
            Payload: `{
              "type":"no_match",
              "message":"The customer has been recognised as ineligible",
              "data":{
                "sbi":"108675111",
                "crn":"1103314955",
                "businessEmail":"business3@email.com",
                "interestRegisteredAt":"2023-02-23T09:43:33.150Z",
                "onWaitingList":false,
                "waitingUpdatedAt":"n/a",
                "eligible":false,
                "ineligibleReason":"No match against data warehouse",
                "accessGranted":false,
                "accessGrantedAt":"n/a"
              },
              "raisedBy":"business3@email.com",
              "raisedOn":"2023-02-23T09:43:33.159Z"
            }`,
            Status: 'success'
          }
        ]
      },
      expect: {
        parsedEvents: [
          {
            sbi: '108675111',
            crn: '1103314955',
            businessEmail: 'business3@email.com',
            registrationOfInterestTimestamp: '2023-02-22T09:43:33.150Z',
            eligible: false,
            ineligibleReason: 'No match against data warehouse',
            onWaitingList: 'FALSE',
            accessGranted: false,
            accessGrantedTimestamp: 'n/a'
          },
          {
            sbi: '108675111',
            crn: '1103314955',
            businessEmail: 'business3@email.com',
            registrationOfInterestTimestamp: '2023-02-23T09:43:33.150Z',
            eligible: false,
            ineligibleReason: 'No match against data warehouse',
            onWaitingList: 'FALSE',
            accessGranted: false,
            accessGrantedTimestamp: 'n/a'
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
