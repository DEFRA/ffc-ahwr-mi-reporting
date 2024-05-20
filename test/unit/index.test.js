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
          EventType: 'eventType',
          Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"reference":"TEMP-931B-C490","organisation":{"sbi":"106401373","farmerName":"Trevor John Hale","name":"M & G Williams","email":"trevorhalec@elahroverts.com.test","address":""}},"raisedBy":"trevorhalec@elahroverts.com.test","raisedOn":"2024-02-15T13:23:57.287Z"}'
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
      EventType: 'farmerApplyData-organisation',
      EventRaised: new Date().toISOString(),
      Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"reference":"TEMP-931B-C490","organisation":{"sbi":"106401373","farmerName":"Trevor John Hale","name":"M & G Williams","email":"trevorhalec@elahroverts.com.test","address":""}},"raisedBy":"trevorhalec@elahroverts.com.test","raisedOn":"2024-02-15T13:23:57.287Z"}'
    }, {
      partitionKey: 'partition',
      EventRaised: new Date().toISOString(),
      EventType: 'ineligibility-event',
      Payload: '{"type":"ineligibility-event","message":"Apply: LockedBusinessError","data":{"sbi":"106363424","crn":"1100514988","exception":"LockedBusinessError","raisedAt":"2024-02-15T13:23:39.830Z","journey":"apply","reference":"TEMP-EFF4-B965"},"raisedBy":"trevorhalec@elahroverts.com.test","raisedOn":"2024-02-15T13:23:40.068Z"}'
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
