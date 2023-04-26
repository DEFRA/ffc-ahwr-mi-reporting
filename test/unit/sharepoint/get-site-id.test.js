const { when, resetAllWhenMocks } = require('jest-when')
const Wreck = require('@hapi/wreck')

jest.mock('@hapi/wreck')

const MOCK_SITE_ID = 'mock_site_id'

describe('getSiteId', () => {
  let logSpy
  let errorSpy
  let getSiteId

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log')
    errorSpy = jest.spyOn(console, 'error')

    jest.mock('../../../ffc-ahwr-mi-reporting/feature-toggle/config', () => ({
      sharePoint: {
        enabled: true
      }
    }))

    jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/config', () => ({
      hostname: 'hostname',
      sitePath: 'site_path'
    }))
  })

  afterEach(() => {
    resetAllWhenMocks()
    jest.clearAllMocks()
    jest.resetModules()
  })

  test.each([
    {
      toString: () => 'retry policy applied',
      given: {
        cockatiel: {
          config: {
            enabled: true
          }
        },
        aadToken: {
          accessToken: 'access_token'
        }
      },
      when: {
        Wreck: {
          get: [
            {
              res: {
                statusCode: 500,
                statusMessage: 'Internal Error'
              }
            },
            {
              res: {
                statusCode: 500,
                statusMessage: 'Internal Error'
              }
            },
            {
              res: {
                statusCode: 200
              },
              payload: {
                id: MOCK_SITE_ID
              }
            }
          ]
        }
      },
      expect: {
        error: undefined,
        consoleLogs: [
          `Getting the site ID: ${JSON.stringify({
            accessToken: 'acces...token'
          })}`
        ],
        errorLogs: []
      }
    },
    {
      toString: () => 'retry policy with the circut breaker',
      given: {
        cockatiel: {
          config: {
            enabled: true,
            halfOpenAfter: 1 * 1000,
            consecutiveBreaker: 1,
            maxAttempts: 1
          }
        },
        aadToken: {
          accessToken: 'access_token'
        }
      },
      when: {
        Wreck: {
          get: [
            {
              res: {
                statusCode: 500,
                statusMessage: 'Internal Error'
              }
            },
            {
              res: {
                statusCode: 200
              },
              payload: {
                id: MOCK_SITE_ID
              }
            }
          ]
        }
      },
      expect: {
        error: 'Execution prevented because the circuit breaker is open',
        consoleLogs: [
          `Getting the site ID: ${JSON.stringify({
            accessToken: 'acces...token'
          })}`,
          `Getting the site ID: ${JSON.stringify({
            accessToken: 'acces...token'
          })}`
        ],
        errorLogs: []
      }
    }
  ])('%s', async (testCase) => {
    const MOCK_COCKATIEL_CONFIG = testCase.given.cockatiel.config
    jest.mock('../../../ffc-ahwr-mi-reporting/cockatiel/config', () => MOCK_COCKATIEL_CONFIG)
    getSiteId = require('../../../ffc-ahwr-mi-reporting/sharepoint/get-site-id')

    const whenGet = when(Wreck.get)
      .calledWith(
        'https://graph.microsoft.com/v1.0/sites/hostname:/site_path',
        {
          headers: {
            Authorization: `Bearer ${testCase.given.aadToken.accessToken}`
          },
          json: true
        }
      )
    testCase.when.Wreck.get.forEach(response => {
      whenGet.mockResolvedValueOnce(response)
    })

    if (testCase.expect.error) {
      await expect(
        Promise.all([
          getSiteId(testCase.given.aadToken.accessToken),
          getSiteId(testCase.given.aadToken.accessToken)
        ])
      ).rejects.toThrowError(testCase.expect.error)
    } else {
      const siteId = await getSiteId(testCase.given.aadToken.accessToken)
      expect(siteId).toEqual(MOCK_SITE_ID)
    }

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
