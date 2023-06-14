const {
  connect,
  queryEntitiesByTimestamp,
  writeFile,
  downloadFile
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

  describe('queryEntitiesByTimestamp', () => {
    test('should return an array of events', async () => {
      const result = await queryEntitiesByTimestamp('tableName')
      expect(result).toEqual(['event1', 'event2'])
    })
  })

  describe('downloadFile', () => {
    test('should download the file from the storage container', async () => {
      const filename = 'test.txt'

      const buffer = await downloadFile(filename)

      const downloadedContent = buffer.toString('utf-8')
      expect(downloadedContent).toBe('This is a test file.')
    })
  })

  describe('writeFile', () => {
    test('should upload the file from the storage container', async () => {
      const filename = 'test.txt'
      const content = 'content'

      await expect(writeFile(filename, content)).resolves.toBeUndefined()
    })
  })
})
