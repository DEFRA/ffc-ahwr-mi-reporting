const mockAzureStorageWriteFile = jest.fn()
const mockAzureStorageDownloadFile = jest.fn()
const mockSharepointUploadFile = jest.fn()

describe('buildAhwrMiReportV3', () => {
  describe('buildAhwrMiReportV3 - sharepoint on', () => {
    let buildAhwrMiReportV3

    beforeAll(() => {
      jest.mock('../../../ffc-ahwr-mi-reporting/feature-toggle/config', () => ({
        sharePoint: {
          enabled: true
        }
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/config', () => ({
        tenantId: 'tenant_id',
        clientId: 'client_id',
        clientSecret: 'client_secret',
        hostname: 'hostname',
        sitePath: 'site_path',
        documentLibrary: 'document_lib',
        dstFolder: 'dst_folder'
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/csv/create-csv-filename', () => {
        return jest.fn(reportName => `${reportName}.csv`)
      })

      jest.mock('../../../ffc-ahwr-mi-reporting/mi-report-v3/transformJsonToCsvV3.js', () => {
        return jest.fn(events => [
          {
            // mocked event
          }
        ])
      })

      jest.mock('../../../ffc-ahwr-mi-reporting/storage/storage', () => ({
        writeFile: mockAzureStorageWriteFile,
        downloadFile: mockAzureStorageDownloadFile
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/ms-graph', () => ({
        uploadFile: mockSharepointUploadFile
      }))

      buildAhwrMiReportV3 = require('../../../ffc-ahwr-mi-reporting/mi-report-v3')
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.resetModules()
    })

    test('should create and upload CSV file', async () => {
      const events = [{ /* Mocked event data here */ }]

      mockAzureStorageDownloadFile.mockResolvedValue('downloadedFile')

      await buildAhwrMiReportV3(events)

      expect(mockAzureStorageWriteFile).toHaveBeenCalledWith('ahwr-mi-report-v3-.csv', [{}])
      expect(mockSharepointUploadFile).toHaveBeenCalledWith(expect.any(String), 'ahwr-mi-report-v3-.csv', 'downloadedFile')
    })
  /*
    test('should not upload to SharePoint when feature toggle is disabled', async () => {
      const events = [{ }]
      const reportName = 'testReport'
      const fileName = `${reportName}.csv`

      const disabledSharePointConfig = {
        featureToggle: {
          sharePoint: {
            enabled: false
          }
        }
      }

      await buildAhwrMiReportv3(events, reportName, disabledSharePointConfig)

      expect(mockWriteFile).toHaveBeenCalledWith(fileName, 'csvData')
      expect(mockUploadFile).not.toHaveBeenCalled()
    })
  */
    // Add more test cases as needed
  })

  describe('buildAhwrMiReportv3 - no events found', () => {
    let buildAhwrMiReportv3

    beforeAll(() => {
      jest.mock('../../../ffc-ahwr-mi-reporting/feature-toggle/config', () => ({
        sharePoint: {
          enabled: true
        }
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/config', () => ({
        tenantId: 'tenant_id',
        clientId: 'client_id',
        clientSecret: 'client_secret',
        hostname: 'hostname',
        sitePath: 'site_path',
        documentLibrary: 'document_lib',
        dstFolder: 'dst_folder'
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/csv/create-csv-filename', () => {
        return jest.fn(reportName => `${reportName}.csv`)
      })

      jest.mock('../../../ffc-ahwr-mi-reporting/mi-report-v3/transformJsonToCsvV3.js', () => {
        return jest.fn(events => [])
      })

      jest.mock('../../../ffc-ahwr-mi-reporting/storage/storage', () => ({
        writeFile: mockAzureStorageWriteFile,
        downloadFile: mockAzureStorageDownloadFile
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/ms-graph', () => ({
        uploadFile: mockSharepointUploadFile
      }))

      buildAhwrMiReportv3 = require('../../../ffc-ahwr-mi-reporting/mi-report-v3')
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.resetModules()
    })

    test('should not create nor upload CSV file', async () => {
      const events = [{ /* Mocked event data here */ }]

      mockAzureStorageDownloadFile.mockResolvedValue('downloadedFile')

      await buildAhwrMiReportv3(events)

      expect(mockAzureStorageWriteFile).not.toHaveBeenCalled()
      expect(mockSharepointUploadFile).not.toHaveBeenCalled()
    })
  })

  describe('buildAhwrMiReportv3 - sharepoint off', () => {
    let buildAhwrMiReportv3

    beforeAll(() => {
      jest.mock('../../../ffc-ahwr-mi-reporting/feature-toggle/config', () => ({
        sharePoint: {
          enabled: false
        }
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/config', () => ({
        tenantId: 'tenant_id',
        clientId: 'client_id',
        clientSecret: 'client_secret',
        hostname: 'hostname',
        sitePath: 'site_path',
        documentLibrary: 'document_lib',
        dstFolder: 'dst_folder'
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/csv/create-csv-filename', () => {
        return jest.fn(reportName => `${reportName}.csv`)
      })

      jest.mock('../../../ffc-ahwr-mi-reporting/mi-report-v3/transformJsonToCsvV3.js', () => {
        return jest.fn(events => [
          {
            // mocked event
          }
        ])
      })

      jest.mock('../../../ffc-ahwr-mi-reporting/storage/storage', () => ({
        writeFile: mockAzureStorageWriteFile,
        downloadFile: mockAzureStorageDownloadFile
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/ms-graph', () => ({
        uploadFile: mockSharepointUploadFile
      }))

      buildAhwrMiReportv3 = require('../../../ffc-ahwr-mi-reporting/mi-report-v3')
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.resetModules()
    })

    test('should not upload to SharePoint when feature toggle is disabled', async () => {
      const events = [{ }]

      await buildAhwrMiReportv3(events)

      expect(mockAzureStorageWriteFile).toHaveBeenCalledWith('ahwr-mi-report-v3-.csv', [{}])
      expect(mockSharepointUploadFile).not.toHaveBeenCalled()
    })
  })
})
