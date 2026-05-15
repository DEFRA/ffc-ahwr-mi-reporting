const FEATURE_TOGGLE_PATH = '../../../ffc-ahwr-mi-reporting/feature-toggle/config'

describe('feature-toggle config', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV }
    delete process.env.SHAREPOINT_ENABLED
    delete process.env.POULTRY_RELEASE_DATE
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
  })

  describe('sharePoint.enabled', () => {
    test('defaults to false when SHAREPOINT_ENABLED is not set', () => {
      const config = require(FEATURE_TOGGLE_PATH)

      expect(config.sharePoint.enabled).toBe(false)
    })

    test('is true when SHAREPOINT_ENABLED is the string "true"', () => {
      process.env.SHAREPOINT_ENABLED = 'true'

      const config = require(FEATURE_TOGGLE_PATH)

      expect(config.sharePoint.enabled).toBe(true)
    })

    test('is false when SHAREPOINT_ENABLED is the string "false"', () => {
      process.env.SHAREPOINT_ENABLED = 'false'

      const config = require(FEATURE_TOGGLE_PATH)

      expect(config.sharePoint.enabled).toBe(false)
    })

    test('throws when SHAREPOINT_ENABLED is not a valid boolean string', () => {
      process.env.SHAREPOINT_ENABLED = 'yes'

      expect(() => require(FEATURE_TOGGLE_PATH)).toThrow(/feature toggle config is invalid/)
    })
  })

  describe('poultryReleaseDate', () => {
    test('is undefined when POULTRY_RELEASE_DATE is not set', () => {
      const config = require(FEATURE_TOGGLE_PATH)

      expect(config.poultryReleaseDate).toBeUndefined()
    })

    test('is set when POULTRY_RELEASE_DATE is provided', () => {
      process.env.POULTRY_RELEASE_DATE = '2025-04-25T00:00:00.000Z'

      const config = require(FEATURE_TOGGLE_PATH)

      expect(config.poultryReleaseDate).toBe('2025-04-25T00:00:00.000Z')
    })
  })
})
