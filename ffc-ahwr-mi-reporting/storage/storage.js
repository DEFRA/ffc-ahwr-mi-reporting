const { TableClient, odata } = require('@azure/data-tables')
const { BlobServiceClient } = require('@azure/storage-blob')
const { connectionString, containerName, tableName, pageSize } = require('../config/config')
const logger = require('../config/logging')
let tableClient
let blobServiceClient
let container
let containersInitialised
let appendBlobClient

const { transformEventToCsvV3, columns } = require('../mi-report-v3/transformJsonToCsvV3')

const initialiseContainers = async () => {
  logger.info('Making sure blob containers exist')
  await container.createIfNotExists()
  containersInitialised = true
}

const connect = async () => {
  logger.info(`Connecting to storage with connectionString containerName ${containerName} tableName ${tableName}`)
  blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  container = blobServiceClient.getContainerClient(containerName)
  containersInitialised ?? await initialiseContainers()
  tableClient = TableClient.fromConnectionString(connectionString, tableName, { allowInsecureConnection: true })
}

const processEntitiesByTimestampPaged = async (tableName, fileName) => {
  const queryFilter = odata`Timestamp ge datetime'${new Date(2022, 1, 1).toISOString()}'`

  const eventResults = (tableName
    ? TableClient.fromConnectionString(connectionString, tableName, { allowInsecureConnection: true })
    : tableClient
  ).listEntities({ queryOptions: { filter: queryFilter } })

  logger.info(`pageSize ${pageSize}`)

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
    logger.info('write CSV headers to append blob')
  }

  let pageCount = 0
  let eventItemCount = 0

  for await (const eventsPage of eventsIterator) {
    pageCount++
    logger.info(`Current page ${pageCount}`)
    // append csv file

    let rowContent = ''

    for await (const event of eventsPage) {
      const csvRow = transformEventToCsvV3(event)
      rowContent += csvRow + '\n'
      eventItemCount++
    }

    await appendBlobClient.appendBlock(rowContent, Buffer.byteLength(rowContent))
    logger.info(`Page ${pageCount} and ${eventItemCount} event items written to append blob`)
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
