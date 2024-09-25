const mockAzureStorageWriteFile = jest.fn()
const mockAzureStorageDownloadFile = jest.fn()
const mockSharepointUploadFile = jest.fn()
const mockStreamJsonToCsv = jest.fn()
const mockUploadFileToAzureBlob = jest.fn()
const mockFsReadFileSync = jest.fn()
const mockFsUnlinkSync = jest.fn()

jest.mock('fs', () => ({
  readFileSync: mockFsReadFileSync,
  unlinkSync: mockFsUnlinkSync
}))

jest.mock('../../../ffc-ahwr-mi-reporting/storage/storage', () => ({
  writeFile: mockAzureStorageWriteFile,
  downloadFile: mockAzureStorageDownloadFile
}))

jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/ms-graph', () => ({
  uploadFile: mockSharepointUploadFile
}))

jest.mock('../../../ffc-ahwr-mi-reporting/mi-report-v3/transformJsonToCsvV3', () => ({
  streamJsonToCsv: mockStreamJsonToCsv,
  uploadFileToAzureBlob: mockUploadFileToAzureBlob
}))

jest.mock('../../../ffc-ahwr-mi-reporting/csv/create-csv-filename', () => jest.fn((reportName) => `${reportName}.csv`))

jest.mock('../../../ffc-ahwr-mi-reporting/config/config', () => ({
  featureToggle: {
    sharePoint: {
      enabled: true
    }
  },
  sharePoint: {
    dstFolder: 'dst_folder',
    documentLibrary: 'document_lib'
  },
  connectionString: 'mock-connection-string',
  containerName: 'mock-container',
  environment: 'test-env'
}))

const buildAhwrMiReportV3 = require('../../../ffc-ahwr-mi-reporting/mi-report-v3')
const path = require('path')

describe('buildAhwrMiReportV3', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  test('should create and upload CSV file to both Azure Blob Storage and SharePoint', async () => {
    const events = [{ /* Mock event data */ }]
    const mockCsvFilePath = path.join('tmp', 'testfile.csv')

    // Mocking function behaviors
    mockStreamJsonToCsv.mockResolvedValueOnce(mockCsvFilePath)
    mockUploadFileToAzureBlob.mockResolvedValueOnce()
    mockFsReadFileSync.mockReturnValueOnce('file-content')
    mockSharepointUploadFile.mockResolvedValueOnce()

    await buildAhwrMiReportV3(events)

    // Check CSV generation
    expect(mockStreamJsonToCsv).toHaveBeenCalledWith(events, expect.any(String))

    // Check upload to Azure Blob Storage
    expect(mockUploadFileToAzureBlob).toHaveBeenCalledWith(expect.any(String), 'mock-container', 'ahwr-mi-report-v3-.csv', 'mock-connection-string')

    // Check SharePoint upload
    expect(mockFsReadFileSync).toHaveBeenCalledWith(expect.any(String))
    expect(mockSharepointUploadFile).toHaveBeenCalledWith(expect.any(String), 'ahwr-mi-report-v3-.csv', 'file-content')

    // Check temporary file deletion
    expect(mockFsUnlinkSync).toHaveBeenCalledWith(expect.any(String))
  })

  test('should create and upload CSV file to only Azure Blob Storage when SharePoint upload is disabled', async () => {
    jest.mock('../../../ffc-ahwr-mi-reporting/config/config', () => ({
      featureToggle: {
        sharePoint: {
          enabled: false
        }
      },
      sharePoint: {
        dstFolder: 'dst_folder',
        documentLibrary: 'document_lib'
      },
      connectionString: 'mock-connection-string',
      containerName: 'mock-container',
      environment: 'test-env'
    }))

    const events = [{ /* Mock event data */ }]
    const mockCsvFilePath = path.join('tmp', 'testfile.csv')

    // Mocking function behaviors
    mockStreamJsonToCsv.mockResolvedValueOnce(mockCsvFilePath)
    mockUploadFileToAzureBlob.mockResolvedValueOnce()
    mockFsReadFileSync.mockReturnValueOnce('file-content')

    await buildAhwrMiReportV3(events)

    // Check CSV generation
    expect(mockStreamJsonToCsv).toHaveBeenCalledWith(events, expect.any(String))

    // Check upload to Azure Blob Storage
    expect(mockUploadFileToAzureBlob).toHaveBeenCalledWith(expect.any(String), 'mock-container', 'ahwr-mi-report-v3-.csv', 'mock-connection-string')

    // Check that SharePoint upload did not happen
    expect(mockSharepointUploadFile).not.toHaveBeenCalled()

    // Check temporary file deletion
    expect(mockFsUnlinkSync).toHaveBeenCalledWith(expect.any(String))
  })

  test('should not create nor upload CSV file when no events are present', async () => {
    const events = []

    await buildAhwrMiReportV3(events)

    // Ensure CSV generation, uploads, and deletions were not called
    expect(mockStreamJsonToCsv).not.toHaveBeenCalled()
    expect(mockUploadFileToAzureBlob).not.toHaveBeenCalled()
    expect(mockSharepointUploadFile).not.toHaveBeenCalled()
    expect(mockFsUnlinkSync).not.toHaveBeenCalled()
  })
})
