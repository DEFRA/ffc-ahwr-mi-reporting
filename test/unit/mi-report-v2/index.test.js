const mockAzureStorageWriteFile = jest.fn()
const mockAzureStorageDownloadFile = jest.fn()
const mockSharepointUploadFile = jest.fn()

describe('buildAhwrMiReportV2', () => {
  describe('buildAhwrMiReportV2 - sharepoint on', () => {
    let buildAhwrMiReportV2

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

      jest.mock('../../../ffc-ahwr-mi-reporting/mi-report-v2/transformJsonToCsv.js', () => {
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

      buildAhwrMiReportV2 = require('../../../ffc-ahwr-mi-reporting/mi-report-v2')
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.resetModules()
    })

    test('should create and upload CSV file', async () => {
      const events = [{ /* Mocked event data here */ }]

      mockAzureStorageDownloadFile.mockResolvedValue('downloadedFile')

      await buildAhwrMiReportV2(events)

      expect(mockAzureStorageWriteFile).toHaveBeenCalledWith('ahwr-mi-report-v2-.csv', [{}])
      expect(mockSharepointUploadFile).toHaveBeenCalledWith(expect.any(String), 'ahwr-mi-report-v2-.csv', 'downloadedFile')
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

      await buildAhwrMiReportV2(events, reportName, disabledSharePointConfig)

      expect(mockWriteFile).toHaveBeenCalledWith(fileName, 'csvData')
      expect(mockUploadFile).not.toHaveBeenCalled()
    })
  */
    // Add more test cases as needed
  })

  describe('buildAhwrMiReportV2 - no events found', () => {
    let buildAhwrMiReportV2

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

      jest.mock('../../../ffc-ahwr-mi-reporting/mi-report-v2/transformJsonToCsv.js', () => {
        return jest.fn(events => [])
      })

      jest.mock('../../../ffc-ahwr-mi-reporting/storage/storage', () => ({
        writeFile: mockAzureStorageWriteFile,
        downloadFile: mockAzureStorageDownloadFile
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/ms-graph', () => ({
        uploadFile: mockSharepointUploadFile
      }))

      buildAhwrMiReportV2 = require('../../../ffc-ahwr-mi-reporting/mi-report-v2')
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.resetModules()
    })

    test('should not create nor upload CSV file', async () => {
      const events = [{ /* Mocked event data here */ }]

      mockAzureStorageDownloadFile.mockResolvedValue('downloadedFile')

      await buildAhwrMiReportV2(events)

      expect(mockAzureStorageWriteFile).not.toHaveBeenCalled()
      expect(mockSharepointUploadFile).not.toHaveBeenCalled()
    })
  })

  describe('buildAhwrMiReportV2 - sharepoint off', () => {
    let buildAhwrMiReportV2

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

      jest.mock('../../../ffc-ahwr-mi-reporting/mi-report-v2/transformJsonToCsv.js', () => {
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

      buildAhwrMiReportV2 = require('../../../ffc-ahwr-mi-reporting/mi-report-v2')
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.resetModules()
    })

    test('should not upload to SharePoint when feature toggle is disabled', async () => {
      const events = [{ }]

      await buildAhwrMiReportV2(events)

      expect(mockAzureStorageWriteFile).toHaveBeenCalledWith('ahwr-mi-report-v2-.csv', [{}])
      expect(mockSharepointUploadFile).not.toHaveBeenCalled()
    })
  })
})
