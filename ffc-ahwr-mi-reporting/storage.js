const { TableClient, odata } = require('@azure/data-tables')
const { BlobServiceClient } = require('@azure/storage-blob')
const { connectionString, containerName, tableName } = require('./config')
let tableClient
let blobServiceClient
let container

const connect = () => {
  console.log('Connecting to storage', connectionString, containerName, tableName)
  blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  container = blobServiceClient.getContainerClient(containerName)
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
