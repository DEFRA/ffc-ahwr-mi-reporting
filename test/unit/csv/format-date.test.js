const moment = require('moment')
const formatDate = require('../../../ffc-ahwr-mi-reporting/csv/format-date')

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
    },
    {
      toString: () => 'undefined',
      given: {
        date: undefined
      },
      when: {
        format: moment.ISO_8601
      },
      expect: {
        formattedDate: undefined
      }
    },
    {
      toString: () => 'n/a',
      given: {
        date: 'n/a'
      },
      when: {
        format: moment.ISO_8601
      },
      expect: {
        formattedDate: undefined
      }
    },
    {
      toString: () => 'empty string',
      given: {
        date: ''
      },
      when: {
        format: moment.ISO_8601
      },
      expect: {
        formattedDate: undefined
      }
    }
  ])('%s', async (testCase) => {
    expect(
      formatDate(testCase.given.date, testCase.when.format)
    ).toEqual(testCase.expect.formattedDate)
  })
})
