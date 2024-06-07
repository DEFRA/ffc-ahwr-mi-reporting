describe('report error handling', () => {
  let generateReport, mockStorage, mockContext, mockTimer, mockBuildMiReport, mockBuildMiReportV2, mockBuildMiReportV3
  jest.resetAllMocks()

  beforeAll(() => {
    generateReport = require('../../ffc-ahwr-mi-reporting')
    mockContext = require('../mock/mock-context')
    mockTimer = require('../mock/mock-timer')
    jest.mock('../../ffc-ahwr-mi-reporting/storage/storage', () => {
      return {
        queryEntitiesByTimestamp: jest.fn().mockResolvedValue([{
          foo: 'bar',
          EventType: 'eventType',
          Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"reference":"TEMP-931B-C490","organisation":{"sbi":"106401373","farmerName":"Trevor John Hale","name":"M & G Williams","email":"trevorhalec@elahroverts.com.test","address":""}},"raisedBy":"trevorhalec@elahroverts.com.test","raisedOn":"2024-02-15T13:23:57.287Z"}'
        }]),
        connect: jest.fn(),
        writeFile: jest.fn(),
        downloadFile: jest.fn()
      }
    })

    mockStorage = require('../../ffc-ahwr-mi-reporting/storage/storage')
    jest.mock('../../ffc-ahwr-mi-reporting/storage/storage')
    mockBuildMiReport = require('../../ffc-ahwr-mi-reporting/mi-report')
    jest.mock('../../ffc-ahwr-mi-reporting/mi-report')
    mockBuildMiReportV2 = require('../../ffc-ahwr-mi-reporting/mi-report-v2')
    jest.mock('../../ffc-ahwr-mi-reporting/mi-report-v2')
    mockBuildMiReportV3 = require('../../ffc-ahwr-mi-reporting/mi-report-v3')
    jest.mock('../../ffc-ahwr-mi-reporting/mi-report-v3')
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  test('succesfull run should call all 3 reports', async () => {
    await generateReport(mockContext, mockTimer)

    expect(mockStorage.connect).toHaveBeenCalled()
    expect(mockStorage.queryEntitiesByTimestamp).toHaveBeenCalled()
    expect(mockBuildMiReport).toHaveBeenCalled()
    expect(mockBuildMiReportV2).toHaveBeenCalled()
    expect(mockBuildMiReportV3).toHaveBeenCalled()
  })

  test('succesfully run 2 when buildMIReport failed', async () => {
    mockBuildMiReport.mockImplementation(() => {
      throw new Error('Error')
    })
    await generateReport(mockContext, mockTimer)

    expect(mockStorage.connect).toHaveBeenCalled()
    expect(mockStorage.queryEntitiesByTimestamp).toHaveBeenCalled()
    expect(mockBuildMiReport).toHaveBeenCalled()
    expect(mockBuildMiReportV2).toHaveBeenCalled()
    expect(mockBuildMiReportV3).toHaveBeenCalled()
  })

  test('succesfully run 1 when buildMIReport and builMiReportV2 failed', async () => {
    mockBuildMiReportV2.mockImplementation(() => {
      throw new Error('Error')
    })
    await generateReport(mockContext, mockTimer)

    expect(mockStorage.connect).toHaveBeenCalled()
    expect(mockStorage.queryEntitiesByTimestamp).toHaveBeenCalled()
    expect(mockBuildMiReport).toHaveBeenCalled()
    expect(mockBuildMiReportV2).toHaveBeenCalled()
    expect(mockBuildMiReportV3).toHaveBeenCalled()
  })

  test('succesfully finish althoght buildMIReport, builMiReportV2 and buildMiReportV3 failed', async () => {
    mockBuildMiReportV3.mockImplementation(() => {
      throw new Error('Error')
    })
    await generateReport(mockContext, mockTimer)

    expect(mockStorage.connect).toHaveBeenCalled()
    expect(mockStorage.queryEntitiesByTimestamp).toHaveBeenCalled()
    expect(mockBuildMiReport).toHaveBeenCalled()
    expect(mockBuildMiReportV2).toHaveBeenCalled()
    expect(mockBuildMiReportV3).toHaveBeenCalled()
  })
})
