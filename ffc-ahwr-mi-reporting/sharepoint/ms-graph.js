const Wreck = require('@hapi/wreck')
const config = require('../config/config')
const azureAD = require('./azure-ad')

const CHUNK_SIZE = 8 * 1024 * 1024 // 8 MB

const graphUrl = {
  sites: 'https://graph.microsoft.com/v1.0/sites'
}

const getSiteId = async (accessToken, context) => {
  context.log.info('Getting the site ID')
  const response = await Wreck.get(
      `${graphUrl.sites}/${config.sharePoint.hostname}:/${config.sharePoint.sitePath}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        json: true
      }
  )
  if (response.res.statusCode !== 200) {
    throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
  }
  return response.payload.id
}

const getDriveId = async (siteId, accessToken, context) => {
  context.log.info(`Getting the drive ID: ${siteId.slice(0, 5)}...${siteId.slice(-5)}`)
  const response = await Wreck.get(
      `${graphUrl.sites}/${siteId}/drives`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        json: true
      }
  )
  if (response.res.statusCode !== 200) {
    throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
  }
  const drive = response.payload.value.find(drive => drive.name === config.sharePoint.documentLibrary)
  if (typeof drive === 'undefined') {
    throw new Error(`No drive found: ${JSON.stringify({ name: config.sharePoint.documentLibrary })}`)
  }
  return drive.id
}

const uploadBlobToSharePoint = async (
  pathToFile,
  fileName,
  fileContentAndLength,
  context,
  chunkSize = CHUNK_SIZE
) => {
  context.log.info(`Uploading file: fileName: ${fileName}, pathToFile: ${pathToFile}`)
  const aadToken = await azureAD.acquireToken()
  const siteId = await getSiteId(aadToken.accessToken, context)
  const driveId = await getDriveId(siteId, aadToken.accessToken, context)
  const { fileContentStream, contentLength } = fileContentAndLength

  const { uploadUrl } = await createUploadSession(
    siteId,
    driveId,
    pathToFile,
    fileName,
    aadToken.accessToken,
    context
  )

  await uploadStreamToSharePoint(
    fileContentStream,
    uploadUrl,
    contentLength,
    context,
    chunkSize
  )

  context.log.info('Blob upload to SharePoint completed')
}

const uploadStreamToSharePoint = async (
  readableStream,
  uploadUrl,
  totalSize,
  context, chunkSize
) => {
  let start = 0
  let buffer = Buffer.alloc(0)

  try {
    for await (const chunk of readableStream) {
      buffer = Buffer.concat([buffer, chunk])

      while (buffer.length >= chunkSize) {
        const slice = buffer.subarray(0, chunkSize)
        buffer = buffer.subarray(chunkSize)

        const end = start + slice.length - 1

        context.log.info(`Uploading bytes ${start}-${end}/${totalSize} to ${uploadUrl}`)

        await Wreck.put(uploadUrl, {
          payload: slice,
          headers: {
            'Content-Length': slice.length,
            'Content-Range': `bytes ${start}-${end}/${totalSize}`
          }
        })

        start = end + 1
      }
    }

    // Upload remaining bytes
    if (buffer.length > 0) {
      const end = start + buffer.length - 1

      context.log.info(`Uploading final bytes ${start}-${end}/${totalSize} to ${uploadUrl}`)

      await Wreck.put(uploadUrl, {
        payload: buffer,
        headers: {
          'Content-Length': buffer.length,
          'Content-Range': `bytes ${start}-${end}/${totalSize}`
        }
      })
    }
  } catch (error) {
    context.log.error(`Error uploading to SharePoint: ${error.message}`)
    throw error
  }
}

const createUploadSession = async (siteId, driveId, pathToFile, fileName, token, context) => {
  const safeFileName = fileName.replace(/["*:<>?/|\\]/g, '').trim()
  const encodePath = (path) =>
    path.split('/').map(encodeURIComponent).join('/')

  const url = `${graphUrl.sites}/${siteId}/drives/${driveId}/root:/${encodePath(pathToFile)}/${encodeURIComponent(safeFileName)}:/createUploadSession`

  context.log.info(`Creating upload session at ${url}`)

  try {
    const response = await Wreck.post(url, {
      payload: JSON.stringify({
        item: {
          '@microsoft.graph.conflictBehavior': 'replace',
          name: safeFileName
        }
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    context.log.info(`Upload session created: ${JSON.stringify(response.payload)}`)
    return JSON.parse(response.payload.toString('utf8'))
  } catch (error) {
    context.log.error(`Error creating upload session: ${error.message}`)
    if (error.data) {
      context.log.error(
        `Graph error: ${JSON.stringify(error.data, null, 2)}`
      )
    }
    throw error
  }
}

module.exports = {
  uploadBlobToSharePoint
}
