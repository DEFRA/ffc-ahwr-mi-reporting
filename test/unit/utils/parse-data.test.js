const moment = require('moment')
const { formatDate } = require('../../../ffc-ahwr-mi-reporting/utils/parse-data')

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
