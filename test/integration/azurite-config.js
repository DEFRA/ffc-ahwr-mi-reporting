const host = process.env.AZURITE_HOST ?? '127.0.0.1'
const blobPort = process.env.AZURITE_BLOB_PORT ?? '10005'
const tablePort = process.env.AZURITE_TABLE_PORT ?? '10007'
const account = process.env.AZURITE_ACCOUNT ?? 'devstoreaccount1'
const key = process.env.AZURITE_KEY

if (!key) {
  throw new Error('AZURITE_KEY environment variable is not set. See README for instructions.')
}
const runId = Date.now()

module.exports = {
  account,
  key,
  host,
  blobPort,
  tablePort,
  blobUrl: `http://${host}:${blobPort}/${account}`,
  connectionString: [
    'DefaultEndpointsProtocol=http',
    `AccountName=${account}`,
    `AccountKey=${key}`,
    `BlobEndpoint=http://${host}:${blobPort}/${account}`,
    `QueueEndpoint=http://${host}:10006/${account}`,
    `TableEndpoint=http://${host}:${tablePort}/${account}`
  ].join(';'),
  tableName: `ahwreventstore${runId}`,
  containerName: `reports${runId}`
}
