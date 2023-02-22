const parseEvents = require('../../ffc-ahwr-mi-reporting/mi-report/parse-events')

describe('Parse Events', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  test.each([
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
