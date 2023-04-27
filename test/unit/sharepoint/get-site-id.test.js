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

    jest.mock('../../../ffc-ahwr-mi-reporting/cockatiel-wreck/config', () => ({
      enabled: true
    }))

    getSiteId = require('../../../ffc-ahwr-mi-reporting/sharepoint/get-site-id')
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
        consoleLogs: [
          `sharepoint:getSiteId: ${JSON.stringify({
            attempt: 1
          })}`,
          `sharepoint:getSiteId: ${JSON.stringify({
            attempt: 2
          })}`,
          `sharepoint:getSiteId: ${JSON.stringify({
            attempt: 3
          })}`
        ],
        errorLogs: []
      }
    }
  ])('%s', async (testCase) => {
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
