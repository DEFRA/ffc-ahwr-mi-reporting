const { when, resetAllWhenMocks } = require('jest-when')
const Wreck = require('@hapi/wreck')

jest.mock('@hapi/wreck')

const MOCK_SITE_ID = 'mock_site_id'
const MOCK_DRIVE_ID = 'mock_drive_id'
const MOCK_FILEPATH = 'mock_filepath'
const MOCK_FILENAME = 'mock_filename'
const MOCK_CONTENT = 'mock_content'

describe('putContent', () => {
  let logSpy
  let errorSpy
  let putContent

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
      enabled: true,
      maxAttempts: 3,
      halfOpenAfter: 10 * 1000,
      consecutiveBreaker: 4
    }))

    putContent = require('../../../ffc-ahwr-mi-reporting/sharepoint/put-content')
  })

  afterEach(() => {
    resetAllWhenMocks()
    jest.clearAllMocks()
    jest.resetModules()
  })

  test.each([
    {
      toString: () => 'both retry policy and circuit breaker applied',
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
                statusCode: 500,
                statusMessage: 'Internal Error'
              }
            },
            {
              res: {
                statusCode: 500,
                statusMessage: 'Internal Error'
              }
            }
          ]
        }
      },
      expect: {
        consoleLogs: [
          `sharepoint:putContent: ${JSON.stringify({
            attempt: 1
          })}`,
          `sharepoint:putContent: ${JSON.stringify({
            attempt: 2
          })}`,
          `sharepoint:putContent: ${JSON.stringify({
            attempt: 3
          })}`,

          `sharepoint:putContent: ${JSON.stringify({
            attempt: 1
          })}`,
          `sharepoint:putContent: ${JSON.stringify({
            attempt: 2
          })}`,
          `sharepoint:putContent: ${JSON.stringify({
            attempt: 3
          })}`,
          `sharepoint:putContent: ${JSON.stringify({
            attempt: 4
          })}`
        ],
        errorLogs: []
      }
    }
  ])('%s', async (testCase) => {
    const whenPut = when(Wreck.put)
      .calledWith(
        `https://graph.microsoft.com/v1.0/sites/${MOCK_SITE_ID}/drives/${MOCK_DRIVE_ID}/root:/${MOCK_FILEPATH}/${MOCK_FILENAME}:/content`,
        {
          headers: {
            Authorization: `Bearer ${testCase.given.aadToken.accessToken}`
          },
          payload: MOCK_CONTENT
        }
      )
    testCase.when.Wreck.get.forEach(response => {
      whenPut.mockResolvedValueOnce(response)
    })

    // 3 attempts - 2 failures + 1 success
    await putContent(testCase.given.aadToken, MOCK_SITE_ID, MOCK_DRIVE_ID, MOCK_FILEPATH, MOCK_FILENAME, MOCK_CONTENT)

    // 4 attemps - 3 retries + 1 final failure
    await expect(
      () => putContent(testCase.given.aadToken, MOCK_SITE_ID, MOCK_DRIVE_ID, MOCK_FILEPATH, MOCK_FILENAME, MOCK_CONTENT)
    ).rejects.toThrowError('HTTP 500 (Internal Error)')

    // No further attempt was made as circuit breaker stopped it
    await expect(
      () => putContent(testCase.given.aadToken, MOCK_SITE_ID, MOCK_DRIVE_ID, MOCK_FILEPATH, MOCK_FILENAME, MOCK_CONTENT)
    ).rejects.toThrowError('Execution prevented because the circuit breaker is open')

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
