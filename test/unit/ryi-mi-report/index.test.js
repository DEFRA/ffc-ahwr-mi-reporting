describe('AHWR RYI MI Report', () => {
  describe('Build RYI Mi Report - config.featureToggle.sharePoint.disabled', () => {
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

      jest.mock('../../../ffc-ahwr-mi-reporting/eligibility-mi-report/parse-events')
      const parseEvents = require('../../../ffc-ahwr-mi-reporting/eligibility-mi-report/parse-events')
      parseEvents.mockImplementationOnce(() => []).mockImplementation(() => [{ value1: 'value1', value2: 'value2', value3: 'value3' }])

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
      const buildEligibilityMiReport = require('../../../ffc-ahwr-mi-reporting/eligibility-mi-report/index')
      buildEligibilityMiReport(null)
      expect(logSpy).toHaveBeenNthCalledWith(1, `${MOCK_NOW.toISOString()} Creating, storing but not uploading AHWR Eligibility MI Report: ${JSON.stringify({
            fileName: 'fileName'
          })}`)
      expect(logSpy).toHaveBeenNthCalledWith(2, `${MOCK_NOW.toISOString()} No data found to create: ${JSON.stringify({ fileName: 'fileName' })}`)
    })

    test('Events found', async () => {
      const buildEligibilityMiReport = require('../../../ffc-ahwr-mi-reporting/eligibility-mi-report/index')
      await buildEligibilityMiReport('value1,value2,value3')
      expect(logSpy).toHaveBeenCalledTimes(2)
      expect(logSpy).toHaveBeenNthCalledWith(1, `${MOCK_NOW.toISOString()} Creating, storing but not uploading AHWR Eligibility MI Report: ${JSON.stringify({
            fileName: 'fileName'
          })}`)
      expect(logSpy).toHaveBeenNthCalledWith(2, `${MOCK_NOW.toISOString()} AHWR Eligibility MI Report has been stored but not uploaded: ${JSON.stringify({
            fileName: 'fileName'
          })}`)
    })
  })

  describe('Build RYI Mi Report - config.featureToggle.sharePoint.enabled', () => {
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

      jest.mock('../../../ffc-ahwr-mi-reporting/ryi-mi-report/create-rows')
      const createRows = require('../../../ffc-ahwr-mi-reporting/ryi-mi-report/create-rows')
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
      const buildAhwrRyiMiReport = require('../../../ffc-ahwr-mi-reporting/ryi-mi-report/index')

      await buildAhwrRyiMiReport(null)

      expect(logSpy).toHaveBeenNthCalledWith(1, `${MOCK_NOW.toISOString()} ahwr-ryi-mi-report: Creating a CSV file: ${JSON.stringify({
          fileName: 'fileName'
        })}`)
      expect(logSpy).toHaveBeenNthCalledWith(2, `${MOCK_NOW.toISOString()} ahwr-ryi-mi-report: No data found to create a CSV file: ${JSON.stringify({ fileName: 'fileName' })}`)
    })

    test('Events found', async () => {
      const buildAhwrRyiMiReport = require('../../../ffc-ahwr-mi-reporting/ryi-mi-report/index')
      await buildAhwrRyiMiReport('value1,value2,value3')
      expect(logSpy).toHaveBeenCalledTimes(3)
      expect(logSpy).toHaveBeenNthCalledWith(1, `${MOCK_NOW.toISOString()} ahwr-ryi-mi-report: Creating a CSV file: ${JSON.stringify({
        fileName: 'fileName'
      })}`)
      expect(logSpy).toHaveBeenNthCalledWith(2, `${MOCK_NOW.toISOString()} ahwr-ryi-mi-report: CSV file has been uploaded to Azure Storage: ${JSON.stringify({
        fileName: 'fileName'
      })}`)
      expect(logSpy).toHaveBeenNthCalledWith(3, `${MOCK_NOW.toISOString()} ahwr-ryi-mi-report: CSV file has been uploaded to SharePoint: ${JSON.stringify({
        dstFolder: 'dstFolder/environment/' + MOCK_NOW.getFullYear() + '/' + (MOCK_NOW.getMonth() + 1).toString().padStart(2, '0'),
        fileName: 'fileName'
      })}`)
    })
  })
})
