const { when, resetAllWhenMocks } = require('jest-when')
const Wreck = require('@hapi/wreck')
const getSiteId = require('../../../ffc-ahwr-mi-reporting/sharepoint/get-site-id')

jest.mock('@hapi/wreck')

jest.mock('../../../ffc-ahwr-mi-reporting/feature-toggle/config', () => ({
  sharePoint: {
    enabled: true
  }
}))

jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/config', () => ({
  hostname: 'hostname',
  sitePath: 'site_path'
}))

jest.mock('../../../ffc-ahwr-mi-reporting/cockatiel/config', () => ({
  enabled: true
}))

const MOCK_SITE_ID = 'mock_site_id'

describe('getSiteId', () => {
  let logSpy
  let errorSpy

  beforeAll(() => {
    logSpy = jest.spyOn(console, 'log')
    errorSpy = jest.spyOn(console, 'error')
  })

  afterEach(() => {
    jest.clearAllMocks()
    resetAllWhenMocks()
  })

  test.each([
    {
      toString: () => 'retry policy applied',
      given: {
        aadToken: {
          accessToken: 'access_token'
        }
      },
      when: {
        Wreck: {
          get: {
            response1: {
              res: {
                statusCode: 500,
                statusMessage: 'Internal Error'
              }
            },
            response2: {
              res: {
                statusCode: 500,
                statusMessage: 'Internal Error'
              }
            },
            response3: {
              res: {
                statusCode: 200
              },
              payload: {
                id: MOCK_SITE_ID
              }
            }
          }
        }
      },
      expect: {
        consoleLogs: [
          `Getting the site ID: ${JSON.stringify({
            accessToken: 'acces...token'
          })}`
        ],
        errorLogs: []
      }
    }
  ])('%s', async (testCase) => {
    when(Wreck.get)
      .calledWith(
        'https://graph.microsoft.com/v1.0/sites/hostname:/site_path',
        {
          headers: {
            Authorization: `Bearer ${testCase.given.aadToken.accessToken}`
          },
          json: true
        }
      )
      .mockResolvedValueOnce(testCase.when.Wreck.get.response1)
      .mockResolvedValueOnce(testCase.when.Wreck.get.response2)
      .mockResolvedValueOnce(testCase.when.Wreck.get.response3)

    const siteId = await getSiteId(testCase.given.aadToken.accessToken)

    expect(siteId).toEqual(MOCK_SITE_ID)

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, expect.stringContaining(consoleLog))
    )
    expect(logSpy).toHaveBeenCalledTimes(testCase.expect.consoleLogs.length)

    testCase.expect.errorLogs.forEach(
      (errorLog, idx) => expect(errorSpy).toHaveBeenNthCalledWith(idx + 1, errorLog)
    )
    expect(errorSpy).toHaveBeenCalledTimes(testCase.expect.errorLogs.length)
  })
})
