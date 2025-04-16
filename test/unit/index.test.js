const { queryEntitiesByTimestamp, connect } = require('../../ffc-ahwr-mi-reporting/storage/storage')
const buildAhwrMiReportV3 = require('../../ffc-ahwr-mi-reporting/mi-report-v3')
const miReportFunction = require('../../ffc-ahwr-mi-reporting') // Adjust the path as necessary
const mockEvents = []
const mockUpload = jest.fn()

jest.mock('../../ffc-ahwr-mi-reporting/mi-report-v3')
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
jest.mock('../../ffc-ahwr-mi-reporting/storage/storage', () => {
  return {
    queryEntitiesByTimestamp: jest.fn().mockResolvedValue([{
      foo: 'bar',
      EventType: 'eventType',
      Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"reference":"TEMP-931B-C490","organisation":{"sbi":"106401373","farmerName":"Trevor John Hale","name":"M & G Williams","email":"trevorhalec@elahroverts.com.test","address":""}},"raisedBy":"trevorhalec@elahroverts.com.test","raisedOn":"2024-02-15T13:23:57.287Z"}'
    }]),
    connect: jest.fn(),
    writeFile: jest.fn(),
    downloadFile: jest.fn()
  }
})
jest.mock('../../ffc-ahwr-mi-reporting/sharepoint/ms-graph', () => ({
  uploadFile: jest.fn()
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
    environment: 'test'
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

describe('miReportFunction', () => {
  let context
  let miReportTimer

  beforeEach(() => {
    buildAhwrMiReportV3.mockImplementation(() => jest.fn())
    context = {
      log: jest.fn()
    }
    miReportTimer = {
      isPastDue: false
    }
  })

  test('should log an error if building the report fails', async () => {
    const events = [{ id: 1 }]
    const error = new Error('Test error')
    connect.mockResolvedValue()
    queryEntitiesByTimestamp.mockResolvedValue(events)
    buildAhwrMiReportV3.mockRejectedValue(error)

    await miReportFunction(context, miReportTimer)

    expect(context.log).toHaveBeenCalledWith('MI report V3 failed: ', error)
  })

  test('should log if the timer is past due', async () => {
    connect.mockResolvedValue()
    queryEntitiesByTimestamp.mockResolvedValue([])
    miReportTimer.isPastDue = true

    await miReportFunction(context, miReportTimer)

    expect(context.log).toHaveBeenCalledWith('Node is running late')
  })
})
