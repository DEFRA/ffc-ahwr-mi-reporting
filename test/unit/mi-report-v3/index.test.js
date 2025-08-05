const { featureToggle } = require('../../../ffc-ahwr-mi-reporting/config/config')
const createFileName = require('../../../ffc-ahwr-mi-reporting/csv/create-csv-filename')
const { connect, processEntitiesByTimestampPaged } = require('../../../ffc-ahwr-mi-reporting/storage/storage')
const { uploadFile } = require('../../../ffc-ahwr-mi-reporting/sharepoint/ms-graph')
const buildAhwrMiReport = require('../../../ffc-ahwr-mi-reporting/mi-report-v3/index')
const mockContext = require('../../mock/mock-context')

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
jest.mock('../../../ffc-ahwr-mi-reporting/csv/create-csv-filename')
jest.mock('../../../ffc-ahwr-mi-reporting/storage/storage')
jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/ms-graph')
jest.mock('../../../ffc-ahwr-mi-reporting/mi-report-v3/get-pig-genetic-sequencing-values', () => ({
  getPigGeneticSequencingValues: jest.fn()
}))

const consoleSpy = jest
  .spyOn(mockContext.log, 'info')

describe('buildAhwrMiReport', () => {
  beforeEach(() => {
    createFileName.mockReturnValue('ahwr-mi-report-v3-fileName')
  })

  afterEach(() => {
    consoleSpy.mockReset()
    jest.clearAllMocks()
  })

  test('should create and store report but not upload to SharePoint if feature toggle is disabled', async () => {
    featureToggle.sharePoint.enabled = false

    await buildAhwrMiReport(mockContext)

    expect(createFileName).toHaveBeenCalledWith('ahwr-mi-report-v3-')
    // TODO AHWR-96 contains AHWR, correct?
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Creating, storing but not uploading AHWR MI Report V3'))
    expect(connect).toHaveBeenCalled()
    expect(processEntitiesByTimestampPaged).toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('AHWR MI Report V3 has been stored but not uploaded'))
  })

  test('should create report, store report and upload to SharePoint', async () => {
    featureToggle.sharePoint.enabled = true

    await buildAhwrMiReport(mockContext)

    expect(createFileName).toHaveBeenCalledWith('ahwr-mi-report-v3-')
    // TODO AHWR-96 contains AHWR, correct?
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Creating, storing and uploading AHWR MI Report V3:'))
    expect(connect).toHaveBeenCalled()
    expect(processEntitiesByTimestampPaged).toHaveBeenCalled()
    expect(uploadFile).toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('AHWR MI Report V3 has been stored and uploaded'))
  })
})
