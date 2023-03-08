const agreementStatusIdToString = require('../../../ffc-ahwr-mi-reporting/mi-report/agreement-status-id-to-string')

describe('agreementStatusIdToString', () => {
  test.each([
    {
      toString: () => 'AGREED',
      given: {
        statusId: 1
      },
      expect: {
        status: 'AGREED'
      }
    },
    {
      toString: () => 'WITHDRAWN',
      given: {
        statusId: 2
      },
      expect: {
        status: 'WITHDRAWN'
      }
    },
    {
      toString: () => 'DATA INPUTTED',
      given: {
        statusId: 3
      },
      expect: {
        status: 'DATA INPUTTED'
      }
    },
    {
      toString: () => 'CLAIMED',
      given: {
        statusId: 4
      },
      expect: {
        status: 'CLAIMED'
      }
    },
    {
      toString: () => 'IN CHECK',
      given: {
        statusId: 5
      },
      expect: {
        status: 'IN CHECK'
      }
    },
    {
      toString: () => 'ACCEPTED',
      given: {
        statusId: 6
      },
      expect: {
        status: 'ACCEPTED'
      }
    },
    {
      toString: () => 'NOT AGREED',
      given: {
        statusId: 7
      },
      expect: {
        status: 'NOT AGREED'
      }
    },
    {
      toString: () => 'PAID',
      given: {
        statusId: 8
      },
      expect: {
        status: 'PAID'
      }
    },
    {
      toString: () => 'READY TO PAY',
      given: {
        statusId: 9
      },
      expect: {
        status: 'READY TO PAY'
      }
    },
    {
      toString: () => 'REJECTED',
      given: {
        statusId: 10
      },
      expect: {
        status: 'REJECTED'
      }
    },
    {
      toString: () => 'OTHER',
      given: {
        statusId: 11
      },
      expect: {
        status: ''
      }
    }
  ])('%s', async (testCase) => {
    expect(
      agreementStatusIdToString(testCase.given.statusId)
    ).toEqual(testCase.expect.status)
  })
})
