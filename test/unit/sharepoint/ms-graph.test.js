const { when, resetAllWhenMocks } = require('jest-when')

const MOCK_NOW = new Date()
const MOCK_ACQUIRE_TOKEN = jest.fn()
const MOCK_SITE_ID = 'mock_site_id'
const MOCK_DRIVE_ID = 'mock_drive_id'

describe('msGraph', () => {
  let logSpy
  let Wreck
  let msGraph

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/config', () => ({
      tenantId: 'tenant_id',
      clientId: 'client_id',
      clientSecret: 'client_secret',
      hostname: 'hostname',
      sitePath: 'site_path',
      documentLibrary: 'document_lib',
      dstFolder: 'dst_folder'
    }))

    jest.mock('@hapi/wreck')
    Wreck = require('@hapi/wreck')

    jest.mock('@pnp/nodejs-commonjs', () => ({
      AdalFetchClient: jest.fn().mockImplementation(() => {
        return {
          acquireToken: MOCK_ACQUIRE_TOKEN
        }
      })
    }))

    logSpy = jest.spyOn(console, 'log')

    msGraph = require('../../../ffc-ahwr-mi-reporting/sharepoint/ms-graph')
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
    resetAllWhenMocks()
  })

  test.each([
    {
      toString: () => 'uploadFile',
      given: {
        pathToFile: 'folder/sub_folder',
        fileName: 'file_name',
        fileContent: 'file_content'
      },
      when: {
        aadToken: {
          accessToken: 'access_token'
        },
        getSiteId: {
          Wreck: {
            get: {
              response: {
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
        getDriveId: {
          Wreck: {
            get: {
              response: {
                res: {
                  statusCode: 200
                },
                payload: {
                  value: [
                    {
                      id: MOCK_DRIVE_ID,
                      name: 'document_lib'
                    }
                  ]
                }
              }
            }
          }
        },
        uploadFile: {
          Wreck: {
            put: {
              response: {
                res: {
                  statusCode: 201
                }
              }
            }
          }
        }
      },
      expect: {
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Uploading file: ${JSON.stringify({
            fileName: 'file_name',
            pathToFile: 'folder/sub_folder'
          })}`,
          `${MOCK_NOW.toISOString()} Getting the site ID: ${JSON.stringify({
            accessToken: 'acces...token'
          })}`,
          `${MOCK_NOW.toISOString()} Getting the drive ID: ${JSON.stringify({
            siteId: 'mock_...te_id',
            accessToken: 'acces...token'
          })}`
        ]
      }
    }
  ])('%s', async (testCase) => {
    when(MOCK_ACQUIRE_TOKEN)
      .calledWith()
      .mockResolvedValue(testCase.when.aadToken)
    when(Wreck.get)
      .calledWith(
        'https://graph.microsoft.com/v1.0/sites/hostname:/site_path',
        {
          headers: {
            Authorization: `Bearer ${testCase.when.aadToken.accessToken}`
          },
          json: true
        }
      )
      .mockResolvedValue(testCase.when.getSiteId.Wreck.get.response)
    when(Wreck.get)
      .calledWith(
        `https://graph.microsoft.com/v1.0/sites/${MOCK_SITE_ID}/drives`,
        {
          headers: {
            Authorization: `Bearer ${testCase.when.aadToken.accessToken}`
          },
          json: true
        }
      )
      .mockResolvedValue(testCase.when.getDriveId.Wreck.get.response)
    when(Wreck.put)
      .calledWith(
        `https://graph.microsoft.com/v1.0/sites/${MOCK_SITE_ID}/drives/${MOCK_DRIVE_ID}/root:/${encodeURIComponent(testCase.given.pathToFile)}/${testCase.given.fileName}:/content`,
        {
          payload: testCase.given.fileContent,
          headers: {
            Authorization: `Bearer ${testCase.when.aadToken.accessToken}`
          }
        }
      )
      .mockResolvedValue(testCase.when.uploadFile.Wreck.put.response)

    await msGraph.uploadFile(
      testCase.given.pathToFile,
      testCase.given.fileName,
      testCase.given.fileContent
    )

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
  })
})
