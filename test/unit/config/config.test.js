describe('config', () => {
  const ORIGINAL_ENV = process.env
  const FEATURE_TOGGLE_PATH = '../../../ffc-ahwr-mi-reporting/feature-toggle/config'
  const SHAREPOINT_CONFIG_PATH = '../../../ffc-ahwr-mi-reporting/sharepoint/config'
  const CONFIG_PATH = '../../../ffc-ahwr-mi-reporting/config/config'

  const mockFeatureToggle = (enabled) => {
    jest.doMock(FEATURE_TOGGLE_PATH, () => ({
      sharePoint: { enabled }
    }))
  }

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV }
    process.env.STORAGE_CONNECTION_STRING = 'UseDevelopmentStorage=true'
    delete process.env.ENVIRONMENT
    delete process.env.PAGE_SIZE
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
  })

  test('returns a fully populated config when all env vars are valid', () => {
    process.env.STORAGE_CONNECTION_STRING = 'connection-string'
    process.env.ENVIRONMENT = 'test'
    process.env.PAGE_SIZE = '500'
    mockFeatureToggle(false)

    const config = require(CONFIG_PATH)

    expect(config).toEqual({
      environment: 'test',
      connectionString: 'connection-string',
      containerName: 'reports',
      tableName: 'ahwreventstore',
      sharePoint: {},
      featureToggle: { sharePoint: { enabled: false } },
      pageSize: 500
    })
  })

  test('throws when STORAGE_CONNECTION_STRING is missing', () => {
    delete process.env.STORAGE_CONNECTION_STRING
    mockFeatureToggle(false)

    expect(() => require(CONFIG_PATH)).toThrow(/"connectionString" is required/)
  })

  test('defaults environment to "unknown" when ENVIRONMENT is unset', () => {
    mockFeatureToggle(false)

    const config = require(CONFIG_PATH)

    expect(config.environment).toBe('unknown')
  })

  test('defaults pageSize to 1000 when PAGE_SIZE is unset', () => {
    mockFeatureToggle(false)

    const config = require(CONFIG_PATH)

    expect(config.pageSize).toBe(1000)
  })

  test('coerces a numeric string PAGE_SIZE to a number', () => {
    process.env.PAGE_SIZE = '250'
    mockFeatureToggle(false)

    const config = require(CONFIG_PATH)

    expect(config.pageSize).toBe(250)
  })

  test('throws when PAGE_SIZE is not numeric', () => {
    process.env.PAGE_SIZE = 'abc'
    mockFeatureToggle(false)

    expect(() => require(CONFIG_PATH)).toThrow(/"pageSize" must be a number/)
  })

  test('throws when PAGE_SIZE is below the minimum', () => {
    process.env.PAGE_SIZE = '0'
    mockFeatureToggle(false)

    expect(() => require(CONFIG_PATH)).toThrow(/"pageSize" must be greater than or equal to 1/)
  })

  test('returns an empty sharePoint object when the feature toggle is disabled', () => {
    const sharepointSentinel = { tenantId: 'should-not-be-used' }
    mockFeatureToggle(false)
    jest.doMock(SHAREPOINT_CONFIG_PATH, () => sharepointSentinel)

    const config = require(CONFIG_PATH)

    expect(config.sharePoint).toEqual({})
    expect(config.sharePoint).not.toBe(sharepointSentinel)
  })

  test('returns the sharepoint config when the feature toggle is enabled', () => {
    const sharepointSentinel = {
      tenantId: 'tid',
      clientId: 'cid',
      clientSecret: 'secret',
      hostname: 'host',
      sitePath: 'site',
      documentLibrary: 'lib',
      dstFolder: 'folder'
    }
    mockFeatureToggle(true)
    jest.doMock(SHAREPOINT_CONFIG_PATH, () => sharepointSentinel)

    const config = require(CONFIG_PATH)

    expect(config.sharePoint).toEqual(sharepointSentinel)
  })
})
