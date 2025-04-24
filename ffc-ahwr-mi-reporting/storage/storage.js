const { TableClient, odata } = require('@azure/data-tables')
const { BlobServiceClient } = require('@azure/storage-blob')
const { connectionString, containerName, tableName, pageSize } = require('../config/config')

let tableClient
let blobServiceClient
let container
let containersInitialised
let appendBlobClient

const { transformEventToCsvV3, columns } = require('../mi-report-v3/transformJsonToCsvV3')
const config = require('../feature-toggle/config')

const EVENT_YEAR_START = 2022

const initialiseContainers = async (context) => {
  if (!containersInitialised) {
    context.log.info('Making sure blob containers exist')
    await container.createIfNotExists()
    containersInitialised = true
  }
}

const connect = async (context) => {
  context.log.info(`Connecting to storage with connectionString containerName ${containerName} tableName ${tableName}`)
  blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  container = blobServiceClient.getContainerClient(containerName)
  await initialiseContainers(context)
  tableClient = TableClient.fromConnectionString(connectionString, tableName, { allowInsecureConnection: true })
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
    const headerContent = columns.join(',') + '\n'
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
      try {

        if (!config.flagReporting.enabled && ['application:unflagged', 'application:flagged'].includes(event.properties?.action?.type)) {
          context.log.info('Not creating row as Flag Reporting is not enabled.')
          continue
        }

        const csvRow = transformEventToCsvV3(event, context)
        rowContent += csvRow + '\n'
        eventItemCount++
      } catch (err) {
        context.log.error('Failed to transform event to csv.', {
          error: err.message,
          event
        })
      }
    }

    await appendBlobClient.appendBlock(rowContent, Buffer.byteLength(rowContent))
    context.log.info(`Page ${pageCount} and ${eventItemCount} event items written to append blob`)
  }
}

const streamBlobToFile = async (fileName) => {
  const blobClient = container.getBlobClient(fileName)

  // Stream the blob from Azure Blob Storage
  const downloadBlockBlobResponse = await blobClient.download(0)
  return downloadBlockBlobResponse.readableStreamBody
}

module.exports = {
  connect,
  processEntitiesByTimestampPaged,
  streamBlobToFile
}
