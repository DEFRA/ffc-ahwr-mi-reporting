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

  test('uses STORAGE_CONNECTION_STRING when it is set', () => {
    jest.replaceProperty(process, 'env', {
      ...baseEnv,
      STORAGE_ACCOUNT_NAME: undefined,
      STORAGE_CONNECTION_STRING: 'UseDevelopmentStorage=true'
    })

    mockFeatureToggle(false)

    const config = require(CONFIG_PATH)

    expect(config.connectionString).toBe('UseDevelopmentStorage=true')
    expect(config.storageAccountName).toBeUndefined()
  })

  test('accepts both STORAGE_CONNECTION_STRING and STORAGE_ACCOUNT_NAME when set together', () => {
    jest.replaceProperty(process, 'env', {
      ...baseEnv,
      STORAGE_ACCOUNT_NAME: 'account-name',
      STORAGE_CONNECTION_STRING: 'UseDevelopmentStorage=true'
    })
    mockFeatureToggle(false)

    const config = require(CONFIG_PATH)

    expect(config.connectionString).toBe('UseDevelopmentStorage=true')
    expect(config.storageAccountName).toBe('account-name')
  })

  test('throws when neither STORAGE_CONNECTION_STRING nor STORAGE_ACCOUNT_NAME is set', () => {
    jest.replaceProperty(process, 'env', {
      ...baseEnv,
      STORAGE_ACCOUNT_NAME: undefined,
      STORAGE_CONNECTION_STRING: undefined
    })
    mockFeatureToggle(false)

    expect(() => require(CONFIG_PATH)).toThrow(/must contain at least one of \[connectionString, storageAccountName\]/)
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
