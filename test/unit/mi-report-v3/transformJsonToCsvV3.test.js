const { streamJsonToCsv, uploadFileToAzureBlob, transformEventToCsvV3 } = require('../../../ffc-ahwr-mi-reporting/mi-report-v3/transformJsonToCsvV3')
const fs = require('fs')
const { BlobServiceClient } = require('@azure/storage-blob')

jest.mock('fs', () => ({
  createWriteStream: jest.fn().mockReturnValue({
    write: jest.fn(),
    end: jest.fn()
  }),
  createReadStream: jest.fn(),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn()
}))

jest.mock('@azure/storage-blob')

describe('transformJsonToCsvV3', () => {
  const events = [
    {
      partitionKey: '123456',
      SessionId: '789123456',
      EventType: 'farmerApplyData-organisation',
      EventRaised: new Date().toISOString(),
      Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"reference":"TEMP-1234-ABCD","organisation":{"sbi":"123456","farmerName":"Farmer Brown","name":"Brown Cow Farm","email":"brown@test.com.test","orgEmail":"brownorg@test.com.test","address":"Yorkshire Moors,AB1 1AB,United Kingdom","crn":"0123456789","frn":"9876543210"}},"raisedBy":"brown@test.com.test","raisedOn":"2024-02-15T13:23:57.287Z"}'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should transform event to CSV row', () => {
    const result = transformEventToCsvV3(events[0])
    const expectedCsvRow =
      '123456,789123456,farmerApplyData-organisation,Session set for farmerApplyData and organisation.,TEMP-1234-ABCD,,,,,123456,0123456789,9876543210,Farmer Brown,Brown Cow Farm,brown@test.com.test,brownorg@test.com.test,Yorkshire Moors AB1 1AB United Kingdom,brown@test.com.test,2024-02-15T13:23:57.287Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,'
    expect(result).toEqual(expectedCsvRow)
  })

  test('should return undefined and log error for missing events', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const result = await streamJsonToCsv([], 'path/to/csv')
    expect(consoleSpy).toHaveBeenCalledWith('No events found')
    expect(result).toBeUndefined()
    consoleSpy.mockRestore()
  })

  test('should write CSV header and rows to file', async () => {
    const writeStreamMock = {
      write: jest.fn(),
      end: jest.fn()
    }
    fs.createWriteStream.mockReturnValue(writeStreamMock)

    const csvFilePath = 'path/to/csv'
    await streamJsonToCsv(events, csvFilePath)

    expect(fs.createWriteStream).toHaveBeenCalledWith(csvFilePath)
    expect(writeStreamMock.write).toHaveBeenCalledWith(expect.stringContaining('sbiFromPartitionKey'))
    expect(writeStreamMock.write).toHaveBeenCalledWith(expect.stringContaining('123456,789123456'))
    expect(writeStreamMock.end).toHaveBeenCalled()
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
          return { value: Buffer.alloc(1024 * 1024 * 4), done: false } // 4MB chunk
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
          return { value: Buffer.alloc(1024 * 1024 * 4), done: false } // 4MB chunk
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
