const { when, resetAllWhenMocks } = require('jest-when')
const mockContext = require('../../mock/mock-context')

const MOCK_NOW = new Date()
const MOCK_ACQUIRE_TOKEN = jest.fn()
const MOCK_SITE_ID = 'mock_site_id'
const MOCK_DRIVE_ID = 'mock_drive_id'

describe('msGraph', () => {
  let logSpy
  let Wreck
  let msGraph

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('../../../ffc-ahwr-mi-reporting/feature-toggle/config', () => ({
      sharePoint: {
        enabled: true
      }
    }))

    jest.mock('../../../ffc-ahwr-mi-reporting/sharepoint/config', () => ({
      tenantId: 'tenant_id',
      clientId: 'client_id',
      clientSecret: 'client_secret',
      hostname: 'hostname',
      sitePath: 'site_path',
      documentLibrary: 'document_lib',
      dstFolder: 'dst_folder'
    }))

    jest.mock('@hapi/wreck')
    Wreck = require('@hapi/wreck')

    jest.mock('@pnp/nodejs-commonjs', () => ({
      AdalFetchClient: jest.fn().mockImplementation(() => {
        return {
          acquireToken: MOCK_ACQUIRE_TOKEN
        }
      })
    }))

    logSpy = jest
      .spyOn(mockContext.log, 'info')

    msGraph = require('../../../ffc-ahwr-mi-reporting/sharepoint/ms-graph')
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
    resetAllWhenMocks()
  })

  function stringToReadableStream (str) {
    const encoder = new TextEncoder()

    return new ReadableStream({
      start (controller) {
        controller.enqueue(encoder.encode(str)) // Uint8Array
        controller.close()
      }
    })
  }

  const successfulSiteResponse = {
    res: {
      statusCode: 200
    },
    payload: {
      id: MOCK_SITE_ID
    }
  }

  const successfulDriveResponse = {
    res: {
      statusCode: 200
    },
    payload: {
      value: [
        {
          id: MOCK_DRIVE_ID,
          name: 'document_lib'
        }
      ]
    }
  }

  const standardInputs = {
    pathToFile: 'folder/sub_folder',
    fileName: 'file_name',
    fileContent: stringToReadableStream('file_content'),
    contentLength: 'file_content'.length
  }

  test('uploadBlobToSharePoint - upload successful', async () => {
    const uploadUrl = 'https://graphapiupload:/example'

    when(MOCK_ACQUIRE_TOKEN)
      .calledWith()
      .mockResolvedValue({
        accessToken: 'access_token'
      })
    when(Wreck.get)
      .calledWith(
        'https://graph.microsoft.com/v1.0/sites/hostname:/site_path',
        expect.anything()
      )
      .mockResolvedValue(successfulSiteResponse)
    when(Wreck.get)
      .calledWith(
        `https://graph.microsoft.com/v1.0/sites/${MOCK_SITE_ID}/drives`,
        expect.anything()
      )
      .mockResolvedValue(successfulDriveResponse)
    when(Wreck.post)
      .calledWith(
        expect.stringMatching(':/createUploadSession'),
        expect.anything()
      )
      .mockResolvedValue({ res: { statusCode: 200 }, payload: { uploadUrl } })

    await msGraph.uploadBlobToSharePoint(
      standardInputs.pathToFile,
      standardInputs.fileName,
      { fileContentStream: standardInputs.fileContent, contentLength: standardInputs.contentLength },
      mockContext, 5)

    expect(Wreck.put).toHaveBeenNthCalledWith(
      1,
      uploadUrl,
      expect.objectContaining({
        payload: Buffer.from('file_'),
        headers: {
          'Content-Length': 5,
          'Content-Range': 'bytes 0-4/12'
        }
      })
    )
    expect(Wreck.put).toHaveBeenNthCalledWith(
      2,
      uploadUrl,
      expect.objectContaining({
        payload: Buffer.from('conte'),
        headers: {
          'Content-Length': 5,
          'Content-Range': 'bytes 5-9/12'
        }
      })
    )
    expect(Wreck.put).toHaveBeenNthCalledWith(
      3,
      uploadUrl,
      expect.objectContaining({
        payload: Buffer.from('nt'),
        headers: {
          'Content-Length': 2,
          'Content-Range': 'bytes 10-11/12'
        }
      })
    )
    expect(logSpy).toHaveBeenCalledWith(
      'Uploading file: fileName: file_name, pathToFile: folder/sub_folder'
    )
    expect(logSpy).toHaveBeenCalledWith(
      `Uploading bytes 0-4/12 to ${uploadUrl}`
    )
    expect(logSpy).toHaveBeenCalledWith(
      `Uploading bytes 5-9/12 to ${uploadUrl}`
    )
    expect(logSpy).toHaveBeenCalledWith(
      `Uploading final bytes 10-11/12 to ${uploadUrl}`
    )
  })

  test('uploadBlobToSharePoint - getSiteId - Bad Request', async () => {
    when(MOCK_ACQUIRE_TOKEN)
      .calledWith()
      .mockResolvedValue({
        accessToken: 'access_token'
      })
    when(Wreck.get)
      .calledWith(
        'https://graph.microsoft.com/v1.0/sites/hostname:/site_path',
        expect.anything()
      )
      .mockResolvedValue({
        res: {
          statusCode: 400,
          statusMessage: 'Bad Request'
        }
      })

    await expect(
      msGraph.uploadBlobToSharePoint(
        standardInputs.pathToFile,
        standardInputs.fileName,
        { fileContentStream: standardInputs.fileContent, contentLength: standardInputs.contentLength },
        mockContext
      )
    ).rejects.toEqual(new Error('HTTP 400 (Bad Request)'))

    expect(Wreck.put).not.toHaveBeenCalled()
    expect(Wreck.post).not.toHaveBeenCalled()
  })

  test('uploadBlobToSharePoint - getDriveId - Bad Request', async () => {
    when(MOCK_ACQUIRE_TOKEN)
      .calledWith()
      .mockResolvedValue({
        accessToken: 'access_token'
      })
    when(Wreck.get)
      .calledWith(
        'https://graph.microsoft.com/v1.0/sites/hostname:/site_path',
        expect.anything()
      )
      .mockResolvedValue(successfulSiteResponse)
    when(Wreck.get)
      .calledWith(
        `https://graph.microsoft.com/v1.0/sites/${MOCK_SITE_ID}/drives`,
        expect.anything()
      )
      .mockResolvedValue({
        res: {
          statusCode: 400,
          statusMessage: 'Bad Request'
        }
      })

    await expect(
      msGraph.uploadBlobToSharePoint(
        standardInputs.pathToFile,
        standardInputs.fileName,
        { fileContentStream: standardInputs.fileContent, contentLength: standardInputs.contentLength },
        mockContext
      )
    ).rejects.toEqual(new Error('HTTP 400 (Bad Request)'))

    expect(Wreck.put).not.toHaveBeenCalled()
    expect(Wreck.post).not.toHaveBeenCalled()
  })

  test('uploadBlobToSharePoint - getDriveId - no drive found', async () => {
    when(MOCK_ACQUIRE_TOKEN)
      .calledWith()
      .mockResolvedValue({
        accessToken: 'access_token'
      })
    when(Wreck.get)
      .calledWith(
        'https://graph.microsoft.com/v1.0/sites/hostname:/site_path',
        expect.anything()
      )
      .mockResolvedValue(successfulSiteResponse)
    when(Wreck.get)
      .calledWith(
        `https://graph.microsoft.com/v1.0/sites/${MOCK_SITE_ID}/drives`,
        expect.anything()
      )
      .mockResolvedValue({
        res: {
          statusCode: 200
        },
        payload: {
          value: [
            {
              id: MOCK_DRIVE_ID,
              name: 'NOT_A_document_lib'
            }
          ]
        }
      })

    await expect(
      msGraph.uploadBlobToSharePoint(
        standardInputs.pathToFile,
        standardInputs.fileName,
        { fileContentStream: standardInputs.fileContent, contentLength: standardInputs.contentLength },
        mockContext
      )
    ).rejects.toEqual(new Error(`No drive found: ${JSON.stringify({
      name: 'document_lib'
    })}`))

    expect(Wreck.put).not.toHaveBeenCalled()
    expect(Wreck.post).not.toHaveBeenCalled()
  })

  test('uploadBlobToSharePoint - error during upload', async () => {
    when(MOCK_ACQUIRE_TOKEN)
      .calledWith()
      .mockResolvedValue({
        accessToken: 'access_token'
      })
    when(Wreck.get)
      .calledWith(
        'https://graph.microsoft.com/v1.0/sites/hostname:/site_path',
        expect.anything()
      )
      .mockResolvedValue(successfulSiteResponse)
    when(Wreck.get)
      .calledWith(
        `https://graph.microsoft.com/v1.0/sites/${MOCK_SITE_ID}/drives`,
        expect.anything()
      )
      .mockResolvedValue(successfulDriveResponse)
    when(Wreck.post)
      .calledWith(
        expect.stringMatching(':/createUploadSession'),
        expect.anything()
      )
      .mockRejectedValue(new Error('HTTP 500 (Internal Error)'))

    await expect(
      msGraph.uploadBlobToSharePoint(
        standardInputs.pathToFile,
        standardInputs.fileName,
        { fileContentStream: standardInputs.fileContent, contentLength: standardInputs.contentLength },
        mockContext
      )
    ).rejects.toEqual(new Error('HTTP 500 (Internal Error)'))

    expect(Wreck.post).toHaveBeenCalledWith(expect.stringMatching(':/createUploadSession'),
      {
        headers: {
          Authorization: 'Bearer access_token',
          'Content-Type': 'application/json'
        },
        payload: '{"item":{"@microsoft.graph.conflictBehavior":"replace","name":"file_name"}}'
      })
    expect(Wreck.put).not.toHaveBeenCalled()
  })
})
