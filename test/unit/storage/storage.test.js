const {
  connect,
  processEntitiesByTimestampPaged,
  streamBlobToFile
} = require('../../../ffc-ahwr-mi-reporting/storage/storage')
const {
  transformEventToCsvV3,
  buildColumns
} = require('../../../ffc-ahwr-mi-reporting/mi-report-v3/transformJsonToCsvV3')
const mockContext = require('../../mock/mock-context')
const {
  transformEventToCsvV3: actualTransformEventToCsvV3
} = jest.requireActual('../../../ffc-ahwr-mi-reporting/mi-report-v3/transformJsonToCsvV3')

const mockAppendBlock = jest.fn().mockResolvedValue(true)

jest.mock('../../../ffc-ahwr-mi-reporting/mi-report-v3/get-pig-genetic-sequencing-values', () => ({
  getPigGeneticSequencingValues: jest.fn()
}))

jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: {
    fromConnectionString: jest.fn().mockReturnValue({
      getContainerClient: jest.fn().mockReturnValue({
        createIfNotExists: jest.fn(),
        getAppendBlobClient: jest.fn().mockImplementation((filename) => {
          if (filename === 'fileNameThatDoesNotExist') {
            return {
              exists: jest.fn().mockResolvedValue(false),
              create: jest.fn().mockResolvedValue(true),
              appendBlock: mockAppendBlock
            }
          } else {
            return {
              exists: jest.fn().mockResolvedValue(true),
              appendBlock: mockAppendBlock
            }
          }
        }),
        getBlobClient: jest.fn().mockImplementation(() => {
          return {
            download: jest.fn().mockResolvedValue({ readableStreamBody: '' })
          }
        })
      })
    })
  }
}))

jest.mock('@azure/data-tables', () => ({
  TableClient: {
    fromConnectionString: jest.fn().mockReturnValue({
      listEntities: jest.fn().mockReturnValue({
        byPage: jest.fn().mockImplementation(async function * () {
          // First page
          yield [
            {
              Payload: JSON.stringify({
                type: 'application:status-updated:1',
                message: 'New application has been created',
                data: {
                  reference: 'AHWR-1234-1234',
                  statusId: 1
                },
                raisedBy: 'admin',
                raisedOn: '2025-01-27T16:22:17.015Z',
                timestamp: '2025-01-27T16:22:17.021Z'
              }),
              EventType: 'application:status-updated:1'
            },
            {
              Payload: JSON.stringify({
                type: 'application-vetRcvs',
                message: 'claim data updated',
                data: {
                  applicationReference: 'AHWR-209E-ED2E',
                  reference: 'AHWR-209E-ED2E',
                  updatedProperty: 'vetRcvs',
                  newValue: '1234567',
                  oldValue: '1234123',
                  note: 'upto 7'
                },
                raisedBy: 'Jane Doe',
                raisedOn: '2025-03-28T12:06:37.489Z'
              }),
              EventType: 'application-vetRcvs'
            },
            {
              Payload: JSON.stringify({
                type: 'application:flagged',
                message: 'Application flagged',
                data: {
                  flagId: 'b6b76548-bd6e-45b3-b137-05d930004c9b',
                  flagDetail: 'Declined multi herds agreement',
                  flagAppliesToMh: true
                },
                raisedBy: 'Jane Doe',
                raisedOn: '2025-03-28T12:06:37.489Z'
              }),
              EventType: 'application:flagged'
            },
            {
              Payload: JSON.stringify({
                type: 'application:unflagged',
                message: 'Application flag removed',
                data: {
                  flagId: 'b6b76548-bd6e-45b3-b137-05d930004c9b'
                },
                raisedBy: 'Jane Doe',
                raisedOn: '2025-03-28T12:06:37.489Z'
              }),
              EventType: 'application:unflagged'
            }
          ]
          // Second page
          yield [
            {
              Payload: JSON.stringify({
                type: 'farmerApplyData-declaration',
                message: 'Session set for farmerApplyData and declaration.',
                data: {
                  reference: 'Temp',
                  declaration: true
                },
                raisedBy: 'johndoe@google.com.test',
                raisedOn: '2024-01-04T21:27:12.490Z'
              }),
              EventType: 'farmerApplyData-declaration'
            }
          ]
        })
      })
    })
  },
  odata: jest.fn()
}))

jest.mock('../../../ffc-ahwr-mi-reporting/mi-report-v3/transformJsonToCsvV3')

const consoleSpy = jest
  .spyOn(mockContext.log, 'info')

const errorSpy = jest
  .spyOn(mockContext.log, 'error')

describe('Storage', () => {
  beforeEach(async () => {
    await connect(mockContext)
  })

  afterEach(() => {
    consoleSpy.mockReset()
    jest.clearAllMocks()
  })

  describe('processEntitiesByTimestampPaged', () => {
    test('should process successfully when file already exists', async () => {
      await processEntitiesByTimestampPaged('fileName', mockContext)

      expect(consoleSpy).toHaveBeenCalledWith('Page 1 and 4 event items written to append blob')
      expect(consoleSpy).toHaveBeenCalledWith('Page 2 and 5 event items written to append blob')
    })

    test('should process successfully when file does not exists', async () => {
      buildColumns.mockImplementation(() => ['someColumn', 'anotherColumn'])
      await processEntitiesByTimestampPaged('fileNameThatDoesNotExist', mockContext)

      expect(consoleSpy).toHaveBeenCalledWith('Page 1 and 4 event items written to append blob')
      expect(consoleSpy).toHaveBeenCalledWith('Page 2 and 5 event items written to append blob')
    })

    test('should continue processing valid events when one event fails', async () => {
      transformEventToCsvV3.mockImplementationOnce(() => { throw new Error('Something went wrong') })
      transformEventToCsvV3.mockImplementation(actualTransformEventToCsvV3)

      await processEntitiesByTimestampPaged('fileName', mockContext)

      expect(errorSpy).toHaveBeenCalledWith('Failed to transform event to csv.', {
        error: 'Something went wrong',
        event: {
          EventType: 'application:status-updated:1',
          Payload: JSON.stringify({
            type: 'application:status-updated:1',
            message: 'New application has been created',
            data: {
              reference: 'AHWR-1234-1234',
              statusId: 1
            },
            raisedBy: 'admin',
            raisedOn: '2025-01-27T16:22:17.015Z',
            timestamp: '2025-01-27T16:22:17.021Z'
          })
        }
      })
      expect(errorSpy).toHaveBeenCalledTimes(1)
      expect(mockAppendBlock).toHaveBeenCalledTimes(2)

      const expectedEventTypes = [
        'application-vetRcvs',
        'application:flagged',
        'application:unflagged',
        'farmerApplyData-declaration'
      ]
      const rows = mockAppendBlock.mock.calls.map(([rowContent]) => rowContent).join('\n')
      for (const eventType of expectedEventTypes) {
        expect(rows).toContain(eventType)
      }
      expect(rows).not.toContain('application:status-updated:1')
    })
  })

  describe('streamBlobToFile', () => {
    test('should process successfully', async () => {
      const readableStreamBody = await streamBlobToFile('fileName')
      expect(readableStreamBody).not.toBeNull()
    })
  })
})
