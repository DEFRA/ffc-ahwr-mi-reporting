const convertFromBoolean = require('../../../ffc-ahwr-mi-reporting/csv/convert-from-boolean')

describe('convertFromBoolean', () => {
  test.each([
    {
      toString: () => 'true -> yes',
      given: {
        value: true
      },
      expect: {
        result: 'yes'
      }
    },
    {
      toString: () => 'false -> no',
      given: {
        value: false
      },
      expect: {
        result: 'no'
      }
    },
    {
      toString: () => 'undefined -> no',
      given: {
        value: undefined
      },
      expect: {
        result: 'no'
      }
    }
  ])('%s', async (testCase) => {
    expect(convertFromBoolean(testCase.given.value)).toEqual(testCase.expect.result)
  })
})
