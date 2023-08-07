const mockAzureStorageWriteFile = jest.fn()
const mockAzureStorageDownloadFile = jest.fn()
const mockSharepointUploadFile = jest.fn()

describe('buildAhwrMiReport', () => {
  describe('buildAhwrMiReport - sharepoint on', () => {
    let buildAhwrMiReport

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

      jest.mock('../../../ffc-ahwr-mi-reporting/mi-report/create-rows', () => {
        return jest.fn(events => [
          {
            // mocked event
          }
        ])
      })

      jest.mock('../../../ffc-ahwr-mi-reporting/csv/convert-to-csv', () => {
        return jest.fn(rows => 'csvData')
      })

      jest.mock('../../../ffc-ahwr-mi-reporting/storage/storage', () => ({
        writeFile: mockAzureStorageWriteFile,
        downloadFile: mockAzureStorageDownloadFile
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/ms-graph', () => ({
        uploadFile: mockSharepointUploadFile
      }))

      buildAhwrMiReport = require('../../../ffc-ahwr-mi-reporting/mi-report/index')
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.resetModules()
    })

    test('should create and upload CSV file', async () => {
      const events = [{ /* Mocked event data here */ }]

      mockAzureStorageDownloadFile.mockResolvedValue('downloadedFile')

      await buildAhwrMiReport(events)

      expect(mockAzureStorageWriteFile).toHaveBeenCalledWith('ahwr-mi-report.csv', 'csvData')
      expect(mockSharepointUploadFile).toHaveBeenCalledWith(expect.any(String), 'ahwr-mi-report.csv', 'downloadedFile')
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

      await buildAhwrMiReport(events, reportName, disabledSharePointConfig)

      expect(mockWriteFile).toHaveBeenCalledWith(fileName, 'csvData')
      expect(mockUploadFile).not.toHaveBeenCalled()
    })
  */
    // Add more test cases as needed
  })

  describe('buildAhwrMiReport - no events found', () => {
    let buildAhwrMiReport

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

      jest.mock('../../../ffc-ahwr-mi-reporting/mi-report/create-rows', () => {
        return jest.fn(events => [])
      })

      jest.mock('../../../ffc-ahwr-mi-reporting/csv/convert-to-csv', () => {
        return jest.fn(rows => 'csvData')
      })

      jest.mock('../../../ffc-ahwr-mi-reporting/storage/storage', () => ({
        writeFile: mockAzureStorageWriteFile,
        downloadFile: mockAzureStorageDownloadFile
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/ms-graph', () => ({
        uploadFile: mockSharepointUploadFile
      }))

      buildAhwrMiReport = require('../../../ffc-ahwr-mi-reporting/mi-report/index')
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.resetModules()
    })

    test('should not create nor upload CSV file', async () => {
      const events = [{ /* Mocked event data here */ }]

      mockAzureStorageDownloadFile.mockResolvedValue('downloadedFile')

      await buildAhwrMiReport(events)

      expect(mockAzureStorageWriteFile).not.toHaveBeenCalled()
      expect(mockSharepointUploadFile).not.toHaveBeenCalled()
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

      await buildAhwrMiReport(events, reportName, disabledSharePointConfig)

      expect(mockWriteFile).toHaveBeenCalledWith(fileName, 'csvData')
      expect(mockUploadFile).not.toHaveBeenCalled()
    })
  */
    // Add more test cases as needed
  })

  describe('buildAhwrMiReport - sharepoint off', () => {
    let buildAhwrMiReport

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

      jest.mock('../../../ffc-ahwr-mi-reporting/mi-report/create-rows', () => {
        return jest.fn(events => [
          {
            // mocked event
          }
        ])
      })

      jest.mock('../../../ffc-ahwr-mi-reporting/csv/convert-to-csv', () => {
        return jest.fn(rows => 'csvData')
      })

      jest.mock('../../../ffc-ahwr-mi-reporting/storage/storage', () => ({
        writeFile: mockAzureStorageWriteFile,
        downloadFile: mockAzureStorageDownloadFile
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/ms-graph', () => ({
        uploadFile: mockSharepointUploadFile
      }))

      buildAhwrMiReport = require('../../../ffc-ahwr-mi-reporting/mi-report/index')
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.resetModules()
    })

    test('should not upload to SharePoint when feature toggle is disabled', async () => {
      const events = [{ }]

      await buildAhwrMiReport(events)

      expect(mockAzureStorageWriteFile).toHaveBeenCalledWith('ahwr-mi-report.csv', 'csvData')
      expect(mockSharepointUploadFile).not.toHaveBeenCalled()
    })
  })
})
