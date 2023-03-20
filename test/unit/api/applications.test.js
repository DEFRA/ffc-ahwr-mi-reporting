const Wreck = require('@hapi/wreck')
jest.mock('@hapi/wreck')
const { getApplications } = require('../../../ffc-ahwr-mi-reporting/api/applications')
const applicationApiUri = 'http://test:3001/api'

describe('Application API', () => {
  test('GetApplications should return empty applications array', async () => {
    jest.mock('@hapi/wreck')
    process.env.APPLICATION_API_URI = 'http://test:3001/api'
    const options = { json: true }
    const wreckResponse = {
      payload: {
        applications: []
      },
      res: {
        statusCode: 502
      }
    }
    Wreck.get = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await getApplications()
    expect(response).not.toBeNull()
    expect(response.applications).toStrictEqual([])
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/application/get`, options)
  })
  test('GetApplications should return valid applications array', async () => {
    jest.mock('@hapi/wreck')
    process.env.APPLICATION_API_URI = 'http://test:3001/api'
    const options = { json: true }
    const wreckResponse = {
      payload: {
        applications: [{

        }]
      },
      res: {
        statusCode: 200
      }
    }
    Wreck.get = jest.fn(async function (_url, _options) {
      return wreckResponse
    })
    const response = await getApplications()
    expect(response).not.toBeNull()
    expect(response.applications).toStrictEqual([{}])
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/application/get`, options)
  })
  test('GetApplications should return null if api not available', async () => {
    jest.mock('@hapi/wreck')
    process.env.APPLICATION_API_URI = 'http://test:3001/api'
    const options = { json: true }
    Wreck.get = jest.fn(async function (_url, _options) {
      throw (new Error('fakeError'))
    })
    const response = await getApplications()
    expect(response).toBeNull()
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${applicationApiUri}/application/get`, options)
  })
})
