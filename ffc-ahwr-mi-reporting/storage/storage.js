const { TableClient, odata } = require('@azure/data-tables')
const { BlobServiceClient } = require('@azure/storage-blob')
const { DefaultAzureCredential } = require('@azure/identity')
const { connectionString, containerName, tableName, pageSize, storageAccountName } = require('../config/config')
const { transformEventToCsvV3, buildColumns } = require('../mi-report-v3/transformJsonToCsvV3')

let tableClient
let blobServiceClient
let container
let containersInitialised
let appendBlobClient

const EVENT_YEAR_START = 2022
const EVENT_TYPES_NOT_NEEDED_BY_REPORTING_TEAM = new Set(['tokens-nonce', 'tokens-state', 'pkcecodes-verifier'])

/** @param {any} event @param {any} context */
const transformEvent = (event, context) => {
  try {
    return transformEventToCsvV3(event, context)
  } catch (err) {
    context.log.error('Failed to transform event to csv.', {
      error: /** @type {Error} */ (err).message,
      event
    })
    return undefined
  }
}

const initialiseContainers = async (context) => {
  if (!containersInitialised) {
    context.log.info('Making sure blob containers exist')
    await container.createIfNotExists()
    containersInitialised = true
  }
}

const connect = async (context) => {
  const authMethod = connectionString ? 'connectionString' : 'storageAccountName'
  context.log.info(`Connecting to storage with ${authMethod} containerName ${containerName} tableName ${tableName}`)

  if (connectionString) {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  } else {
    blobServiceClient = new BlobServiceClient(
      `https://${storageAccountName}.blob.core.windows.net`,
      new DefaultAzureCredential()
    )
  }
  container = blobServiceClient.getContainerClient(containerName)
  await initialiseContainers(context)

  if (connectionString) {
    tableClient = TableClient.fromConnectionString(connectionString, tableName, { allowInsecureConnection: true })
  } else {
    tableClient = new TableClient(
      `https://${storageAccountName}.table.core.windows.net`,
      tableName,
      new DefaultAzureCredential(),
      { allowInsecureConnection: true }
    )
  }
}

const processEntitiesByTimestampPaged = async (fileName, context) => {
  const queryFilter = odata`Timestamp ge datetime'${new Date(EVENT_YEAR_START, 1, 1).toISOString()}'`
  const eventResults = tableClient.listEntities({ queryOptions: { filter: queryFilter } })

  context.log.info(`pageSize ${pageSize}`)

  const eventsIterator = eventResults.byPage({ maxPageSize: pageSize })

  // Create or get an AppendBlobClient for the specific blob (CSV file)
  appendBlobClient = container.getAppendBlobClient(fileName)

  // Check if the append blob already exists
  const exists = await appendBlobClient.exists()

  if (!exists) {
    // If the blob doesn't exist, create it
    await appendBlobClient.create()
    const headerContent = buildColumns().join(',') + '\n'
    await appendBlobClient.appendBlock(headerContent, Buffer.byteLength(headerContent))
    context.log.info('write CSV headers to append blob')
  }

  let pageCount = 0
  let eventItemCount = 0

  for await (const eventsPage of eventsIterator) {
    pageCount++
    context.log.info(`Current page ${pageCount}`)
    // append csv file

    let rowContent = ''

    for await (const event of eventsPage) {
      if (EVENT_TYPES_NOT_NEEDED_BY_REPORTING_TEAM.has(event.EventType)) {
        continue // skip to next event
      }

      const csvRow = transformEvent(event, context)
      if (csvRow !== undefined) {
        rowContent += csvRow + '\n'
        eventItemCount++
      }
    }

    if (rowContent) {
      await appendBlobClient.appendBlock(rowContent, Buffer.byteLength(rowContent))
      context.log.info(`Page ${pageCount} and ${eventItemCount} event items written to append blob`)
    } else {
      context.log.info(`Page ${pageCount} was not written to csv, no rowContent produced for eventsPage`)
    }
  }
}

const streamBlobToFile = async (fileName) => {
  const blobClient = container.getBlobClient(fileName)

  const properties = await blobClient.getProperties()
  const contentLength = properties.contentLength

  // Stream the blob from Azure Blob Storage
  const downloadBlockBlobResponse = await blobClient.download(0)
  return { fileContentStream: downloadBlockBlobResponse.readableStreamBody, contentLength }
}

module.exports = {
  connect,
  processEntitiesByTimestampPaged,
  streamBlobToFile
}
