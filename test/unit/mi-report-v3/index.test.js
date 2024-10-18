const fs = require('fs')
const os = require('os')
const path = require('path')
const { containerName, featureToggle } = require('../../../ffc-ahwr-mi-reporting/config/config.js')
const createFileName = require('../../../ffc-ahwr-mi-reporting/csv/create-csv-filename')
const buildAhwrMiReport = require('../../../ffc-ahwr-mi-reporting/mi-report-v3/index.js')// Adjust the path as necessary
const { uploadFileToAzureBlob } = require('../../../ffc-ahwr-mi-reporting/mi-report-v3/transformJsonToCsvV3.js') // Adjust the path as necessary
const msGraph = require('../../../ffc-ahwr-mi-reporting/sharepoint/ms-graph')// Adjust the path as necessary

jest.mock('fs')
jest.mock('os')
jest.mock('path')
jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/ms-graph')
jest.mock('../../../ffc-ahwr-mi-reporting/csv/create-csv-filename')
jest.mock('../../../ffc-ahwr-mi-reporting/mi-report-v3/transformJsonToCsvV3.js')
jest.mock('../../../ffc-ahwr-mi-reporting/config/config.js', () => ({
  containerName: 'reports',
  environment: 'testEnv',
  connectionString: 'connectionString',
  sharePoint: {
    dstFolder: 'dstFolder'
  },
  featureToggle: {
    sharePoint: {
      enabled: true
    }
  }
}))

describe('buildAhwrMiReport', () => {
  const NOW = Date.now()
  const tmpFilename = `tempfile_${NOW}.csv`

  beforeEach(() => {
    createFileName.mockReturnValue('ahwr-mi-report-v3-fileName')
    os.tmpdir.mockReturnValue('/tmp')
    path.join.mockReturnValue(`/tmp/${tmpFilename}`)
    fs.readFileSync.mockReturnValue(Buffer.from('fileContent'))
    fs.unlinkSync.mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test.skip('should create, store, and upload the AHWR MI Report V3', async () => {
    await buildAhwrMiReport()

    expect(createFileName).toHaveBeenCalledWith('ahwr-mi-report-v3-')
    // expect(streamJsonToCsv).toHaveBeenCalledWith(events, `/tmp/${tmpFilename}`)
    expect(uploadFileToAzureBlob).toHaveBeenCalledWith(`/tmp/${tmpFilename}`, containerName, 'ahwr-mi-report-v3-fileName', 'connectionString')
    expect(fs.readFileSync).toHaveBeenCalledWith(`/tmp/${tmpFilename}`)
    expect(msGraph.uploadFile).toHaveBeenCalledWith('dstFolder/testEnv/2024/10', 'ahwr-mi-report-v3-fileName', Buffer.from('fileContent'))
    expect(fs.unlinkSync).toHaveBeenCalledWith(`/tmp/${tmpFilename}`)
  })

  test.skip('should create and store the AHWR MI Report V3 but not upload to SharePoint if feature toggle is disabled', async () => {
    featureToggle.sharePoint.enabled = false
    await buildAhwrMiReport()

    expect(createFileName).toHaveBeenCalledWith('ahwr-mi-report-v3-')
    // expect(streamJsonToCsv).toHaveBeenCalledWith(events, `/tmp/${tmpFilename}`)
    expect(uploadFileToAzureBlob).toHaveBeenCalledWith(`/tmp/${tmpFilename}`, containerName, 'ahwr-mi-report-v3-fileName', 'connectionString')
    expect(fs.readFileSync).not.toHaveBeenCalled()
    expect(msGraph.uploadFile).not.toHaveBeenCalled()
    expect(fs.unlinkSync).toHaveBeenCalledWith(`/tmp/${tmpFilename}`)
  })
})
