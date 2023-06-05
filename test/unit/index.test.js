let mockEvents = []
jest.mock('@azure/data-tables', () => {
  return {
    odata: jest.fn(),
    TableClient: {
      fromConnectionString: jest.fn().mockImplementation(() => {
        return {
          listEntities: jest.fn().mockImplementation(() => {
            return mockEvents
          })
        }
      })
    }
  }
})

let generateReport
let mockContext
let mockTimer
const mockSendEmail = jest.fn()
const mockUpload = jest.fn()
const mockWriteFile = jest.fn()
const mockEnvironment = 'test'

const MOCK_UPLOAD_FILE = jest.fn()

describe('report', () => {
  beforeAll(() => {
    mockContext = require('../mock/mock-context')
    mockTimer = require('../mock/mock-timer')

    jest.mock('notifications-node-client', () => ({
      NotifyClient: jest.fn().mockImplementation(() => ({
        sendEmail: mockSendEmail,
        prepareUpload: jest.fn().mockReturnValue({ })
      }))
    }))

    jest.mock('../../ffc-ahwr-mi-reporting/storage/storage', () => {
      return {
        queryEntitiesByTimestamp: jest.fn().mockResolvedValue([{
          foo: 'bar',
          EventType: 'eventType'
        }]),
        connect: jest.fn(),
        writeFile: mockWriteFile,
        downloadFile: jest.fn()
      }
    })

    jest.mock('../../ffc-ahwr-mi-reporting/sharepoint/ms-graph', () => ({
      uploadFile: MOCK_UPLOAD_FILE
    }))

    jest.mock('../../ffc-ahwr-mi-reporting/sharepoint/config', () => ({
      sharePoint: {}
    }))
    jest.mock('../../ffc-ahwr-mi-reporting/feature-toggle/config', () => ({
      sharePoint: {
        enabled: true
      }
    }))
    jest.mock('../../ffc-ahwr-mi-reporting/config/config', () => {
      return {
        ...jest.requireActual('../../ffc-ahwr-mi-reporting/config/config'),
        environment: mockEnvironment
      }
    })

    jest.mock('@azure/storage-blob', () => {
      return {
        BlobServiceClient: {
          fromConnectionString: jest.fn().mockImplementation(() => {
            return {
              getContainerClient: jest.fn().mockImplementation(() => {
                return {
                  createIfNotExists: jest.fn(),
                  getBlockBlobClient: jest.fn().mockImplementation(() => {
                    return {
                      upload: mockUpload
                    }
                  })
                }
              })
            }
          })
        }
      }
    })

    generateReport = require('../../ffc-ahwr-mi-reporting')
  })

  beforeEach(() => {
    mockEvents = [{
      partitionKey: 'partition',
      EventType: 'batch-processing',
      EventRaised: new Date().toISOString(),
      Payload: '{"type":"info","message":"Payment request created from batch file","data":{"filename":"SITIELM0003_AP_20220412114822998.dat","sequence":"0003", "batchExportDate": "2022-02-01","paymentRequest":{"sourceSystem":"SFIP","deliveryBody":"RP00","invoiceNumber":"SFI00036146","frn":"3000006147","marketingYear":"2022","paymentRequestNumber":1,"agreementNumber":"SIP003000006147","contractNumber":"SFIP036146","currency":"GBP","schedule":"Q4","dueDate":"2022-12-01","value":100,"correlationId":"000026c9-fb51-491b-9272-1ef6ccd68f15","invoiceLines":[{"schemeCode":"80001","accountCode":"SOS273","fundCode":"DRD10","description":"G00 - Gross value of claim","value":100}]}},"timestamp":"2022-04-14T10:34:46.241Z"}'
    }, {
      partitionKey: 'partition',
      EventRaised: new Date().toISOString(),
      EventType: 'payment-request-enrichment',
      Payload: '{"type":"info","message":"Payment request enriched","data":{"originalPaymentRequest":{"sourceSystem":"SFIP","deliveryBody":"RP00","invoiceNumber":"SFI00037229","frn":"3000007230","marketingYear":"2022","paymentRequestNumber":1,"agreementNumber":"SIP003000007230","contractNumber":"SFIP037229","currency":"GBP","schedule":"Q4","dueDate":"2022-12-01","value":100,"correlationId":"00001395-52e9-4606-8536-842e500e0f45","invoiceLines":[{"schemeCode":"80001","accountCode":"SOS273","fundCode":"DRD10","description":"G00 - Gross value of claim","value":100}]},"paymentRequest":{"sourceSystem":"SFIP","deliveryBody":"RP00","invoiceNumber":"S0037229SFIP037229V001","frn":"3000007230","marketingYear":"2022","paymentRequestNumber":1,"agreementNumber":"SIP003000007230","contractNumber":"SFIP037229","currency":"GBP","schedule":"Q4","dueDate":"01/12/2022","value":10000,"correlationId":"00001395-52e9-4606-8536-842e500e0f45","invoiceLines":[{"schemeCode":"80001","accountCode":"SOS273","fundCode":"DRD10","description":"G00 - Gross value of claim","value":10000}],"schemeId":2,"ledger":"AP"}},"timestamp":"2022-04-13T19:54:28.774Z"}'
    }]
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should write file to share', async () => {
    await generateReport(mockContext, mockTimer)
    expect(mockWriteFile).toHaveBeenCalled()
    expect(MOCK_UPLOAD_FILE).toBeCalledTimes(3)
  })
})
