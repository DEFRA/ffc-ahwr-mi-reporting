describe('createDstFoldername', () => {
  const MOCK_NOW = new Date('2023-05-09T13:31:07.277Z')
  const MOCK_DST_FOLDER = 'dst_folder'
  const MOCK_ENV = 'mock_env'

  let createDstFoldername

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('../../../ffc-ahwr-mi-reporting/config/config', () => {
      return {
        ...jest.requireActual('../../../ffc-ahwr-mi-reporting/config/config'),
        environment: MOCK_ENV,
        sharePoint: {
          dstFolder: MOCK_DST_FOLDER
        }
      }
    })

    createDstFoldername = require('../../../ffc-ahwr-mi-reporting/sharepoint/create-dst-foldername')
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test.each([
    {
      toString: () => 'env.DST_FOLDER/environment/YYYY/MM',
      given: {
      },
      expect: {
        dstFoldername: `${MOCK_DST_FOLDER}/${MOCK_ENV}/2023/05`
      }
    }
  ])('%s', async (testCase) => {
    expect(createDstFoldername()).toEqual(testCase.expect.dstFoldername)
  })
})
