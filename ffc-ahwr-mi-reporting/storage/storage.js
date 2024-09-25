const { TableClient, odata } = require('@azure/data-tables')
const { BlobServiceClient } = require('@azure/storage-blob')
const { connectionString, containerName, tableName } = require('../config/config')

let tableClient
let blobServiceClient
let container
let containersInitialised

// Initialize blob container
const initialiseContainers = async () => {
  console.log('Making sure blob containers exist')
  await container.createIfNotExists()
  containersInitialised = true
}

// Connect to Azure Storage (Blob and Table)
const connect = async () => {
  console.log(`Connecting to storage with connectionString ${connectionString} containerName ${containerName} tableName ${tableName}`)
  blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  container = blobServiceClient.getContainerClient(containerName)
  containersInitialised ?? await initialiseContainers()
  tableClient = TableClient.fromConnectionString(connectionString, tableName, { allowInsecureConnection: true })
}

// Query entities from Azure Table Storage based on a timestamp
const queryEntitiesByTimestamp = async () => {
  const events = []
  const eventResults = tableClient.listEntities({
    queryOptions: {
      filter: odata`Timestamp ge datetime'${new Date(2022, 1, 1).toISOString()}'`
    }
  })

  for await (const event of eventResults) {
    events.push(event)
  }

  return events
}

// Get blob client
const getBlob = async (filename) => {
  return container.getBlockBlobClient(`${filename}`)
}

// Download a file from Azure Blob Storage
const downloadFile = async (filename) => {
  const blob = await getBlob(filename)
  return blob.downloadToBuffer()
}

// Write a file to Azure Blob Storage
const writeFile = async (filename, content) => {
  const blob = container.getBlockBlobClient(filename)
  await blob.upload(content, content.length)
}

module.exports = {
  connect,
  queryEntitiesByTimestamp,
  writeFile,
  downloadFile
}
