const createRows = require('../../../ffc-ahwr-mi-reporting/mi-report/create-rows')

describe('createRows', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  test.each([
    require('./create-rows.scenario.1'),
    require('./create-rows.scenario.2'),
    require('./create-rows.scenario.3'),
    require('./create-rows.scenario.4'),
    require('./create-rows.scenario.5'),
    require('./create-rows.scenario.6'),
    require('./create-rows.scenario.7'),
    require('./create-rows.scenario.8')
  ])('%s', async (testCase) => {
    const parsedEvents = createRows(testCase.given.events)
    expect(parsedEvents).toEqual(testCase.expect.parsedEvents)
  })
})
