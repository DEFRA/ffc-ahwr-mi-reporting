const { TableClient, odata } = require('@azure/data-tables')
const { BlobServiceClient } = require('@azure/storage-blob')
const { connectionString, containerName, tableName } = require('./config')
let tableClient
let blobServiceClient
let container
let containersInitialised

const initialiseContainers = async () => {
  console.log('Making sure blob containers exist')
  await container.createIfNotExists()
  containersInitialised = true
}

const connect = async () => {
  console.log('Connecting to storage', connectionString, containerName, tableName)
  blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  container = blobServiceClient.getContainerClient(containerName)
  containersInitialised ?? await initialiseContainers()
  tableClient = TableClient.fromConnectionString(connectionString, tableName, { allowInsecureConnection: true })
}

const queryEntitiesByTimestamp = async () => {
  const events = []
  const eventResults = tableClient.listEntities({ queryOptions: { filter: odata`Timestamp ge datetime'${new Date(2022, 1, 1).toISOString()}'` } })
  for await (const event of eventResults) {
    events.push(event)
  }
  return events
}

const getBlob = async (filename) => {
  return container.getBlockBlobClient(`${filename}`)
}

const downloadFile = async (filename) => {
  const blob = await getBlob(filename)
  return blob.downloadToBuffer()
}

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
