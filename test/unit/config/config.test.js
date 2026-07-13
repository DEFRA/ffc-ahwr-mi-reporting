describe('config', () => {
  const baseEnv = {
    STORAGE_ACCOUNT_NAME: 'account-name'
  }
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
    jest.replaceProperty(process, 'env', {
      ...baseEnv
    })
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  test('returns a fully populated config when all env vars are valid', () => {
    jest.replaceProperty(process, 'env', {
      STORAGE_ACCOUNT_NAME: 'account-name',
      ENVIRONMENT: 'test',
      PAGE_SIZE: '500'
    })
    mockFeatureToggle(false)

    const config = require(CONFIG_PATH)

    expect(config).toEqual({
      environment: 'test',
      storageAccountName: 'account-name',
      containerName: 'reports',
      tableName: 'ahwreventstore',
      sharePoint: {},
      featureToggle: { sharePoint: { enabled: false } },
      pageSize: 500
    })
  })

  test('throws when STORAGE_ACCOUNT_NAME is missing', () => {
    jest.replaceProperty(process, 'env', {
      STORAGE_ACCOUNT_NAME: undefined
    })
    mockFeatureToggle(false)

    expect(() => require(CONFIG_PATH)).toThrow(/The config is invalid: "storageAccountName" is required/)
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
    jest.replaceProperty(process, 'env', {
      STORAGE_ACCOUNT_NAME: 'account-name',
      PAGE_SIZE: '250'
    })

    mockFeatureToggle(false)

    const config = require(CONFIG_PATH)

    expect(config.pageSize).toBe(250)
  })

  test('throws when PAGE_SIZE is not numeric', () => {
    jest.replaceProperty(process, 'env', {
      STORAGE_ACCOUNT_NAME: 'account-name',
      PAGE_SIZE: 'abc'
    })

    mockFeatureToggle(false)

    expect(() => require(CONFIG_PATH)).toThrow(/"pageSize" must be a number/)
  })

  test('throws when PAGE_SIZE is below the minimum', () => {
    jest.replaceProperty(process, 'env', {
      ...baseEnv,
      PAGE_SIZE: '0'
    })

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
