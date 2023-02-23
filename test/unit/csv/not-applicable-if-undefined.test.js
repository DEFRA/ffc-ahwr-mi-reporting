const notApplicableIfUndefined = require('../../../ffc-ahwr-mi-reporting/csv/not-applicable-if-undefined')

describe('notApplicableIfUndefined(value)', () => {
  test.each([
    {
      toString: () => 'returns n/a if undefined',
      given: {
        value: undefined
      },
      expect: {
        result: 'n/a'
      }
    },
    {
      toString: () => 'returns value if defined',
      given: {
        value: 'abc'
      },
      expect: {
        result: 'abc'
      }
    }
  ])('%s', async (testCase) => {
    expect(
      notApplicableIfUndefined(testCase.given.value)
    ).toEqual(testCase.expect.result)
  })
})
