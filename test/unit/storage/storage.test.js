const {
  connect,
  processEntitiesByTimestampPaged,
  streamBlobToFile
} = require('../../../ffc-ahwr-mi-reporting/storage/storage')
const logger = require('../../../ffc-ahwr-mi-reporting/config/logging')

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
              appendBlock: jest.fn().mockResolvedValue(true)
            }
          } else {
            return {
              exists: jest.fn().mockResolvedValue(true),
              appendBlock: jest.fn().mockResolvedValue(true)
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
        byPage: jest.fn().mockReturnValue(['event1', 'event2'])
      })
    })
  },
  odata: jest.fn()
}))

jest.mock('../../../ffc-ahwr-mi-reporting/mi-report-v3/transformJsonToCsvV3')

const consoleSpy = jest
  .spyOn(logger, 'info')

describe('Storage', () => {
  beforeEach(async () => {
    await connect()
  })

  afterEach(() => {
    consoleSpy.mockReset()
    jest.clearAllMocks()
  })

  describe('processEntitiesByTimestampPaged', () => {
    test('should process successfully when file already exists', async () => {
      await processEntitiesByTimestampPaged('tableName', 'fileName')

      console.log(consoleSpy.mock.calls)
      expect(consoleSpy).toHaveBeenCalledWith('Page 1 and 6 event items written to append blob')
    })

    test('should process successfully when file does not exists', async () => {
      await processEntitiesByTimestampPaged('tableName', 'fileNameThatDoesNotExist')

      console.log(consoleSpy.mock.calls)
      expect(consoleSpy).toHaveBeenCalledWith('Page 1 and 6 event items written to append blob')
    })
  })

  describe('streamBlobToFile', () => {
    test('should process successfully', async () => {
      const readableStreamBody = await streamBlobToFile('fileName')
      expect(readableStreamBody).not.toBeNull()
    })
  })
})
