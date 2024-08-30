describe('check config is complete when sharepoint enable', () => {
  const originalEnv = process.env
  const mockSharepointTenantId = 'Mock Sharepoint tenant id'
  const mockSharepointClientid = 'Mock Sharepoint client id'
  const mockSharepointClientsecret = 'Mock Sharepoint client secret'
  const mockSharepointHostname = 'Mock sharepoint hostname'
  const mockSharepointDocumentlibrary = 'Mock sharepoint document library'
  const mockSharepointSitePath = 'Mock sharepoint site path'
  const mockSharepointDstFolder = 'Mock sharepoint dst folder'
  let sharePoint

  beforeAll(() => {
    jest.resetModules()

    jest.mock('../../../ffc-ahwr-mi-reporting/feature-toggle/config', () => ({
      sharePoint: {
        enabled: true
      }
    }))

    process.env = {
      ...originalEnv,
      SHAREPOINT_TENANT_ID: mockSharepointTenantId,
      SHAREPOINT_CLIENT_ID: mockSharepointClientid,
      SHAREPOINT_CLIENT_SECRET: mockSharepointClientsecret,
      SHAREPOINT_HOSTNAME: mockSharepointHostname,
      SHAREPOINT_DOCUMENT_LIBRARY: mockSharepointDocumentlibrary,
      SHAREPOINT_SITE_PATH: mockSharepointSitePath,
      SHAREPOINT_DST_FOLDER: mockSharepointDstFolder
    }
  })

  afterAll(() => {
    jest.clearAllMocks()
    process.env = originalEnv
  })

  test('schema should be complete', () => {
    sharePoint = require('../../../ffc-ahwr-mi-reporting/sharepoint/config')

    expect(sharePoint.tenantId).toEqual(mockSharepointTenantId)
    expect(sharePoint.clientId).toEqual(mockSharepointClientid)
    expect(sharePoint.clientSecret).toEqual(mockSharepointClientsecret)
    expect(sharePoint.hostname).toEqual(mockSharepointHostname)
    expect(sharePoint.sitePath).toEqual(mockSharepointSitePath)
    expect(sharePoint.documentLibrary).toEqual(mockSharepointDocumentlibrary)
    expect(sharePoint.dstFolder).toEqual(mockSharepointDstFolder)
  })

  test('jest validation should be truthy', () => {
    sharePoint = require('../../../ffc-ahwr-mi-reporting/sharepoint/config')

    expect(sharePoint).toBeTruthy()
  })

  test('when missing any value should promt and error', () => {
    process.env = {}

    try {
      require('../../../ffc-ahwr-mi-reporting/sharepoint/config')
    } catch (error) {
      expect(error.message).toEqual(expect.any(String))
    }
  })
})
