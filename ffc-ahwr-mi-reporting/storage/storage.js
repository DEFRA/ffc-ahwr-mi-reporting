const { TableClient, odata } = require('@azure/data-tables')
const { BlobServiceClient } = require('@azure/storage-blob')
const { connectionString, containerName, tableName } = require('../config/config')
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
  console.log(`Connecting to storage with connectionString ${connectionString} containerName ${containerName} tableName ${tableName}`)
  blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  container = blobServiceClient.getContainerClient(containerName)
  containersInitialised ?? await initialiseContainers()
  tableClient = TableClient.fromConnectionString(connectionString, tableName, { allowInsecureConnection: true })
}

const queryEntitiesByTimestamp = async (tableName) => {
  const events = []
  const eventResults = (tableName
    ? TableClient.fromConnectionString(connectionString, tableName, { allowInsecureConnection: true })
    : tableClient
  ).listEntities({ queryOptions: { filter: odata`Timestamp ge datetime'${new Date(2022, 1, 1).toISOString()}'` } })
  for await (const event of eventResults) {
    events.push(event)
  }
  return events
}
const queryEntitiesByTimestampByDate = async (tableName, startDate = null, endDate = null) => {
  const events = []

  // Default startDate to yesterday's 00:00
  if (!startDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);  // Set to 00:00:00
    startDate = yesterday;
  }

  // Default endDate to today's last midnight (00:00)
  if (!endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Set to 00:00:00
    endDate = today;
  }

  const eventResults = (tableName
    ? TableClient.fromConnectionString(connectionString, tableName, { allowInsecureConnection: true })
    : tableClient
  ).listEntities({
    queryOptions: {
      filter: odata`Timestamp ge datetime'${startDate.toISOString()}' and Timestamp le datetime'${endDate.toISOString()}'`
    }
  });

  for await (const event of eventResults) {
    events.push(event);
  }
  
  return events;
};


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
  queryEntitiesByTimestampByDate,
  writeFile,
  downloadFile
}
