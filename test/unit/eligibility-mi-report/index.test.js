jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/config', () => ({
  dstFolder: 'dstFolder',
  tenantId: 'tenantId',
  clientId: 'clientId',
  clientSecret: 'clientSecret',
  hostname: 'hostname',
  sitePath: 'sitePath',
  documentLibrary: 'documentLibrary'
}))

jest.mock('../../../ffc-ahwr-mi-reporting/config/config', () => ({
  sharePoint: {
    dstFolder: 'dstFolder',
    tenantId: 'tenantId',
    clientId: 'clientId',
    clientSecret: 'clientSecret',
    hostname: 'hostname',
    sitePath: 'sitePath',
    documentLibrary: 'documentLibrary'
  },
  environment: 'environment'
}))

jest.mock('../../../ffc-ahwr-mi-reporting/csv/create-filename', () => jest.fn(() => 'fileName'))
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
const buildEligibilityMiReport = require('../../../ffc-ahwr-mi-reporting/eligibility-mi-report/index')
const { resetAllWhenMocks } = require('jest-when')

const MOCK_NOW = new Date()

describe('Build Eligibility Mi Report', () => {
  let logSpy

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    logSpy = jest.spyOn(console, 'log')
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
    resetAllWhenMocks()
  })

  test('No events found', async () => {
    buildEligibilityMiReport(null)
    expect(logSpy).toHaveBeenNthCalledWith(1, `${MOCK_NOW.toISOString()} Creating and uploading AHWR Eligibility MI Report: ${JSON.stringify({
      dstFolder: 'dstFolder/environment/' + MOCK_NOW.getFullYear() + '/' + (MOCK_NOW.getMonth() + 1),
      fileName: 'fileName'
    })}`)
    expect(logSpy).toHaveBeenNthCalledWith(2, `${MOCK_NOW.toISOString()} No data found to create: ${JSON.stringify({ fileName: 'fileName' })}`)
  })
  test('Events found', async () => {
    buildEligibilityMiReport('value1,value2,value3')
    expect(logSpy).toHaveBeenCalledTimes(2)
    expect(logSpy).toHaveBeenNthCalledWith(1, `${MOCK_NOW.toISOString()} Creating and uploading AHWR Eligibility MI Report: ${JSON.stringify({
      dstFolder: 'dstFolder/environment/' + MOCK_NOW.getFullYear() + '/' + (MOCK_NOW.getMonth() + 1),
      fileName: 'fileName'
    })}`)
    expect(logSpy).toHaveBeenNthCalledWith(2, `${MOCK_NOW.toISOString()} AHWR Eligibility MI Report has been uploaded: ${JSON.stringify({
      dstFolder: 'dstFolder/environment/' + MOCK_NOW.getFullYear() + '/' + (MOCK_NOW.getMonth() + 1),
      fileName: 'fileName'
    })}`)
  })
})
