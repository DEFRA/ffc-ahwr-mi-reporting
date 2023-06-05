describe('AHWR Exception MI Report', () => {
  describe('Build Exception Mi Report - config.featureToggle.sharePoint.disabled', () => {
    const MOCK_NOW = new Date()

    let logSpy

    beforeAll(() => {
      jest.useFakeTimers('modern')
      jest.setSystemTime(MOCK_NOW)

      jest.resetModules()
      jest.resetAllMocks()

      jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/config', () => ({
        dstFolder: 'dstFolder',
        tenantId: 'tenantId',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        hostname: 'hostname',
        sitePath: 'sitePath',
        documentLibrary: 'documentLibrary'
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/feature-toggle/config', () => ({
        sharePoint: {
          enabled: false
        }
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/config/config', () => ({
        ...jest.requireActual('../../../ffc-ahwr-mi-reporting/config/config'),
        environment: 'environment'
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/csv/create-csv-filename', () => jest.fn(() => 'fileName'))
      jest.mock('../../../ffc-ahwr-mi-reporting/csv/convert-to-csv', (rows) => jest.fn((rows) => 'value1,value2,value3'))

      jest.mock('../../../ffc-ahwr-mi-reporting/storage/storage', () => {
        return {
          __esModule: true,
          writeFile: jest.fn(),
          downloadFile: jest.fn(() => 'value1,value2,value3')
        }
      })

      jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/ms-graph', () => {
        return {
          __esModule: true,
          uploadFile: jest.fn()
        }
      })

      jest.mock('../../../ffc-ahwr-mi-reporting/exception-mi-report/create-rows')
      const createRows = require('../../../ffc-ahwr-mi-reporting/ineligibility-mi-report/create-rows')
      createRows.mockImplementationOnce(() => []).mockImplementation(() => [{ value1: 'value1', value2: 'value2', value3: 'value3' }])

      logSpy = jest.spyOn(console, 'log')
    })

    afterAll(() => {
      jest.useRealTimers()

      jest.resetAllMocks()
      jest.resetModules()
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('No events found', async () => {
      const buildExceptionMiReport = require('../../../ffc-ahwr-mi-reporting/ineligibility-mi-report/index')
      buildExceptionMiReport(null)
      expect(logSpy).toHaveBeenNthCalledWith(1, `${MOCK_NOW.toISOString()} ahwr-exception-mi-report: Creating a CSV file: ${JSON.stringify({
            fileName: 'fileName'
          })}`)
      expect(logSpy).toHaveBeenNthCalledWith(2, `${MOCK_NOW.toISOString()} ahwr-exception-mi-report: No data found to create a CSV file: ${JSON.stringify({ fileName: 'fileName' })}`)
    })

    test('Events found', async () => {
      const buildExceptionMiReport = require('../../../ffc-ahwr-mi-reporting/ineligibility-mi-report/index')
      await buildExceptionMiReport('value1,value2,value3')
      expect(logSpy).toHaveBeenCalledTimes(3)
      expect(logSpy).toHaveBeenNthCalledWith(1, `${MOCK_NOW.toISOString()} ahwr-exception-mi-report: Creating a CSV file: ${JSON.stringify({
            fileName: 'fileName'
          })}`)
      expect(logSpy).toHaveBeenNthCalledWith(2, `${MOCK_NOW.toISOString()} ahwr-exception-mi-report: CSV file has been uploaded to Azure Storage: ${JSON.stringify({
            fileName: 'fileName'
          })}`)
      expect(logSpy).toHaveBeenNthCalledWith(3, `${MOCK_NOW.toISOString()} ahwr-exception-mi-report: SharePoint upload disabled ${JSON.stringify({
            fileName: 'fileName'
          })}`)
    })
  })

  describe('Build Exception Mi Report - config.featureToggle.sharePoint.enabled', () => {
    const MOCK_NOW = new Date()

    let logSpy

    beforeAll(() => {
      jest.useFakeTimers('modern')
      jest.setSystemTime(MOCK_NOW)

      jest.resetModules()
      jest.resetAllMocks()

      jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/config', () => ({
        dstFolder: 'dstFolder',
        tenantId: 'tenantId',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        hostname: 'hostname',
        sitePath: 'sitePath',
        documentLibrary: 'documentLibrary'
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/feature-toggle/config', () => ({
        sharePoint: {
          enabled: true
        }
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/config/config', () => ({
        ...jest.requireActual('../../../ffc-ahwr-mi-reporting/config/config'),
        environment: 'environment'
      }))

      jest.mock('../../../ffc-ahwr-mi-reporting/csv/create-csv-filename', () => jest.fn(() => 'fileName'))
      jest.mock('../../../ffc-ahwr-mi-reporting/csv/convert-to-csv', (rows) => jest.fn((rows) => 'value1,value2,value3'))

      jest.mock('../../../ffc-ahwr-mi-reporting/storage/storage', () => {
        return {
          __esModule: true,
          writeFile: jest.fn(),
          downloadFile: jest.fn(() => 'value1,value2,value3')
        }
      })

      jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/ms-graph', () => {
        return {
          __esModule: true,
          uploadFile: jest.fn()
        }
      })

      jest.mock('../../../ffc-ahwr-mi-reporting/exception-mi-report/create-rows')
      const createRows = require('../../../ffc-ahwr-mi-reporting/ineligibility-mi-report/create-rows')
      createRows.mockImplementationOnce(() => []).mockImplementation(() => [{ value1: 'value1', value2: 'value2', value3: 'value3' }])

      logSpy = jest.spyOn(console, 'log')
    })

    afterAll(() => {
      jest.useRealTimers()

      jest.resetAllMocks()
      jest.resetModules()
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    test('No events found', async () => {
      const buildAhwrExceptionMiReport = require('../../../ffc-ahwr-mi-reporting/ineligibility-mi-report/index')

      await buildAhwrExceptionMiReport(null)

      expect(logSpy).toHaveBeenNthCalledWith(1, `${MOCK_NOW.toISOString()} ahwr-exception-mi-report: Creating a CSV file: ${JSON.stringify({
          fileName: 'fileName'
        })}`)
      expect(logSpy).toHaveBeenNthCalledWith(2, `${MOCK_NOW.toISOString()} ahwr-exception-mi-report: No data found to create a CSV file: ${JSON.stringify({ fileName: 'fileName' })}`)
    })

    test('Events found', async () => {
      const buildAhwrExceptionMiReport = require('../../../ffc-ahwr-mi-reporting/ineligibility-mi-report/index')
      await buildAhwrExceptionMiReport('value1,value2,value3')
      expect(logSpy).toHaveBeenCalledTimes(3)
      expect(logSpy).toHaveBeenNthCalledWith(1, `${MOCK_NOW.toISOString()} ahwr-exception-mi-report: Creating a CSV file: ${JSON.stringify({
        fileName: 'fileName'
      })}`)
      expect(logSpy).toHaveBeenNthCalledWith(2, `${MOCK_NOW.toISOString()} ahwr-exception-mi-report: CSV file has been uploaded to Azure Storage: ${JSON.stringify({
        fileName: 'fileName'
      })}`)
      expect(logSpy).toHaveBeenNthCalledWith(3, `${MOCK_NOW.toISOString()} ahwr-exception-mi-report: CSV file has been uploaded to SharePoint: ${JSON.stringify({
        fileName: 'fileName',
        dstFolder: 'dstFolder/environment/' + MOCK_NOW.getFullYear() + '/' + (MOCK_NOW.getMonth() + 1).toString().padStart(2, '0')
      })}`)
    })
  })
})
