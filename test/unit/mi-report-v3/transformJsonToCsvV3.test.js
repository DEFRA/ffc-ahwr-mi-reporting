const { streamJsonToCsv, uploadFileToAzureBlob, transformEventToCsvV3, getBlockSize } = require('../../../ffc-ahwr-mi-reporting/mi-report-v3/transformJsonToCsvV3')
const fs = require('fs')
const { BlobServiceClient } = require('@azure/storage-blob')

jest.mock('fs', () => ({
  createWriteStream: jest.fn().mockReturnValue({
    write: jest.fn(),
    end: jest.fn()
  }),
  createReadStream: jest.fn(),
  unlinkSync: jest.fn()
}))

jest.mock('@azure/storage-blob', () => {
  const mockBlobServiceClient = {
    getContainerClient: jest.fn().mockReturnValue({
      createIfNotExists: jest.fn(),
      getBlockBlobClient: jest.fn().mockReturnValue({
        stageBlock: jest.fn(),
        commitBlockList: jest.fn()
      })
    })
  }

  return {
    BlobServiceClient: {
      fromConnectionString: jest.fn(() => mockBlobServiceClient)
    }
  }
})

describe('streamJsonToCsv', () => {
  test('should write CSV data to file', async () => {
    const mockEvents = [
      { partitionKey: '123', Payload: '{"type":"eventType","data":{}}' }
    ]
    const csvFilePath = 'path/to/csv'

    await streamJsonToCsv(mockEvents, csvFilePath)

    // Verify that fs.createWriteStream was called correctly
    expect(fs.createWriteStream).toHaveBeenCalledWith(csvFilePath)
    // Check if the CSV headers were written
    expect(fs.createWriteStream().write).toHaveBeenCalledWith(expect.stringContaining('sbiFromPartitionKey'))
    // Check if the CSV row was written
    expect(fs.createWriteStream().write).toHaveBeenCalledWith(expect.any(String))
    expect(fs.createWriteStream().end).toHaveBeenCalled()
  })

  test('should handle empty events and log an error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const result = await streamJsonToCsv([], 'path/to/csv')

    expect(consoleSpy).toHaveBeenCalledWith('No events found')
    expect(result).toBeUndefined()
    consoleSpy.mockRestore()
  })
})

describe('uploadFileToAzureBlob', () => {
  const filePath = 'path/to/file.csv'
  const blobContainerName = 'test-container'
  const blobName = 'test-blob.csv'
  const connectionString = 'fake-connection-string'

  test('should upload file to Azure Blob Storage', async () => {
    const mockContainerClient = {
      createIfNotExists: jest.fn(),
      getBlockBlobClient: jest.fn().mockReturnValue({
        stageBlock: jest.fn(),
        commitBlockList: jest.fn()
      })
    }
    BlobServiceClient.fromConnectionString.mockReturnValue({
      getContainerClient: jest.fn().mockReturnValue(mockContainerClient)
    })

    const mockBlobClient = mockContainerClient.getBlockBlobClient()

    fs.createReadStream.mockReturnValue({
      [Symbol.asyncIterator]: jest.fn().mockReturnValue({
        async next () {
          return { value: Buffer.alloc(1024), done: false } // Use 1KB buffer for testing
        }
      })
    })

    await uploadFileToAzureBlob(filePath, blobContainerName, blobName, connectionString)

    expect(mockContainerClient.createIfNotExists).toHaveBeenCalled()
    expect(mockBlobClient.stageBlock).toHaveBeenCalled()
    expect(mockBlobClient.commitBlockList).toHaveBeenCalled()
  })

  test('should handle file upload error', async () => {
    const mockContainerClient = {
      createIfNotExists: jest.fn(),
      getBlockBlobClient: jest.fn().mockReturnValue({
        stageBlock: jest.fn().mockRejectedValue(new Error('Stage block error')),
        commitBlockList: jest.fn()
      })
    }
    BlobServiceClient.fromConnectionString.mockReturnValue({
      getContainerClient: jest.fn().mockReturnValue(mockContainerClient)
    })

    const mockBlobClient = mockContainerClient.getBlockBlobClient()

    fs.createReadStream.mockReturnValue({
      [Symbol.asyncIterator]: jest.fn().mockReturnValue({
        async next () {
          return { value: Buffer.alloc(1024), done: false } // Use 1KB buffer for testing
        }
      })
    })

    await expect(uploadFileToAzureBlob(filePath, blobContainerName, blobName, connectionString)).rejects.toThrow(
      'Stage block error'
    )

    expect(mockBlobClient.stageBlock).toHaveBeenCalled()
    expect(mockBlobClient.commitBlockList).not.toHaveBeenCalled()
  })
})

describe('transformEventToCsvV3', () => {
  test('should transform event to CSV row', () => {
    const event = {
      partitionKey: '123456',
      SessionId: '789123456',
      Payload: '{"type":"eventType","data":{"key":"value"}}'
    }
    const result = transformEventToCsvV3(event)

    // Check if the result contains the CSV-formatted string
    expect(result).toContain('123456')
    expect(result).toContain('789123456')
    expect(result).toContain('eventType')
  })

  test('should handle JSON parse error in event payload', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const event = {
      partitionKey: '123456',
      SessionId: '789123456',
      Payload: '{invalidJSON}'
    }
    transformEventToCsvV3(event)

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(String), event, expect.any(SyntaxError))
    consoleSpy.mockRestore()
  })
})

describe('getBlockSize', () => {
  test('should return block size', () => {
    expect(getBlockSize()).toBe(4 * 1024 * 1024) // 4MB block size
  })
})
