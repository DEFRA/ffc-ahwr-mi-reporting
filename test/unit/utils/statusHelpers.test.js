const { statusToString, statusToId } = require('../../../ffc-ahwr-mi-reporting/utils/statusHelpers')

describe('status to sting', () => {
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
      toString: () => 'ON HOLD',
      given: {
        statusId: 11
      },
      expect: {
        status: 'ON HOLD'
      }
    },
    {
      toString: () => 'RECOMMENDED TO PAY',
      given: {
        statusId: 12
      },
      expect: {
        status: 'RECOMMENDED TO PAY'
      }
    },
    {
      toString: () => 'RECOMMENDED TO REJECT',
      given: {
        statusId: 13
      },
      expect: {
        status: 'RECOMMENDED TO REJECT'
      }
    },
    {
      toString: () => 'OTHER',
      given: {
        statusId: 14
      },
      expect: {
        status: ''
      }
    }
  ])('%s', async (testCase) => {
    expect(
      statusToString(testCase.given.statusId)
    ).toEqual(testCase.expect.status)
  })
})

describe('status to id', () => {
  test.each([
    {
      toString: () => 'Recommend to pay',
      expect: {
        statusId: 12
      },
      given: {
        status: 'Recommend to pay'
      }
    },
    {
      toString: () => 'Recommend to reject',
      expect: {
        statusId: 13
      },
      given: {
        status: 'Recommend to reject'
      }
    },
    {
      toString: () => 'OTHER',
      expect: {
        statusId: ''
      },
      given: {
        status: 'other'
      }
    }
  ])('%s', async (testCase) => {
    expect(
      statusToId(testCase.given.status)
    ).toEqual(testCase.expect.statusId)
  })
})
