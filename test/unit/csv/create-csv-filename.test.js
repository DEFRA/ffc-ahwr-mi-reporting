const createCsvFilename = require('../../../ffc-ahwr-mi-reporting/csv/create-csv-filename')

const MOCK_NOW = new Date()

describe('create-csv-filename', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test.each([
    {
      toString: () => 'returns a CSV filename',
      given: {
        name: 'ahwr-mi-report'
      },
      expect: {
        csvFilename: `ahwr-mi-report ${MOCK_NOW.getFullYear()}-${('0' + (MOCK_NOW.getMonth() + 1)).slice(-2)}-${('0' + MOCK_NOW.getDate()).slice(-2)} ${('0' + MOCK_NOW.getHours()).slice(-2)}${('0' + MOCK_NOW.getMinutes()).slice(-2)}${('0' + MOCK_NOW.getSeconds()).slice(-2)}.csv`
      }
    }
  ])('%s', async (testCase) => {
    expect(
      createCsvFilename(testCase.given.name)
    ).toEqual(testCase.expect.csvFilename)
  })
})
