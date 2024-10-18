const {
  connect,
  processEntitiesByTimestampPaged,
  streamBlobToFile
} = require('../../../ffc-ahwr-mi-reporting/storage/storage')

jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: {
    fromConnectionString: jest.fn().mockReturnValue({
      getContainerClient: jest.fn().mockReturnValue({
        createIfNotExists: jest.fn(),
        getBlockBlobClient: jest.fn().mockImplementation((filename) => {
          if (filename === 'test.txt') {
            return {
              downloadToBuffer: jest.fn().mockResolvedValue('This is a test file.'),
              upload: jest.fn().mockImplementation((content, length) => {
                if (content !== 'content' || length !== content.length) {
                  throw new Error('Assertion failed')
                }
              }),
              exists: jest.fn().mockResolvedValue(true)
            }
          }
          return {}
        })
      })
    })
  }
}))

jest.mock('@azure/data-tables', () => ({
  TableClient: {
    fromConnectionString: jest.fn().mockReturnValue({
      listEntities: jest.fn().mockReturnValue(['event1', 'event2'])
    })
  },
  odata: jest.fn()
}))

describe('Storage', () => {
  beforeEach(async () => {
    await connect()
  })

  describe('processEntitiesByTimestampPaged', () => {
    test.skip('should TODO1', async () => {
      const result = await processEntitiesByTimestampPaged('tableName', 'fileName')
      // TODO AHWR-96 impl
      expect(result).not.toBeNull()
    })
  })

  describe('streamBlobToFile', () => {
    test.skip('should TODO2', async () => {
      const readableStreamBody = await streamBlobToFile('fileName')
      // TODO AHWR-96 impl
      expect(readableStreamBody).not.toBeNull()
    })
  })
})
