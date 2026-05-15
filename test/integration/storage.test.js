// --- Module mocks ---
// These factories use require('./azurite-config') internally to avoid Jest's
// hoisting restrictions on out-of-scope variable references.

jest.mock('@azure/identity', () => ({
  DefaultAzureCredential: jest.fn().mockImplementation(() => ({}))
}))

jest.mock('@azure/storage-blob', () => {
  const actual = jest.requireActual('@azure/storage-blob')
  const { account, key, blobUrl } = require('./azurite-config')
  return {
    ...actual,
    BlobServiceClient: jest.fn().mockImplementation(() =>
      new actual.BlobServiceClient(blobUrl, new actual.StorageSharedKeyCredential(account, key))
    )
  }
})

jest.mock('@azure/data-tables', () => {
  const actual = jest.requireActual('@azure/data-tables')
  const { connectionString } = require('./azurite-config')
  return {
    ...actual,
    TableClient: jest.fn().mockImplementation((url, tableName) =>
      actual.TableClient.fromConnectionString(connectionString, tableName, { allowInsecureConnection: true })
    )
  }
})

jest.mock('../../ffc-ahwr-mi-reporting/config/config.js', () => {
  const { tableName, containerName } = require('./azurite-config')
  return {
    containerName,
    tableName,
    pageSize: 100,
    storageAccountName: 'devstoreaccount1',
    environment: 'integration-test',
    featureToggle: { sharePoint: { enabled: false } }
  }
})

// --- Production code (required after mocks are registered) ---
const { connect, processEntitiesByTimestampPaged } = require('../../ffc-ahwr-mi-reporting/storage/storage')
const mockContext = require('../mock/mock-context')
const featureToggleConfig = require('../../ffc-ahwr-mi-reporting/feature-toggle/config')

// --- Direct Azurite clients for test setup / teardown / assertions ---
const { connectionString, tableName, containerName, account, key, blobUrl } = require('./azurite-config')
const { TableClient } = jest.requireActual('@azure/data-tables')
const { BlobServiceClient, StorageSharedKeyCredential } = jest.requireActual('@azure/storage-blob')

const seedTableClient = TableClient.fromConnectionString(connectionString, tableName, { allowInsecureConnection: true })
const azuriteBlobService = new BlobServiceClient(blobUrl, new StorageSharedKeyCredential(account, key))

// --- Helper: read a blob back as a UTF-8 string ---
/** @param {string} fileName */
async function readBlob (fileName) {
  const blobClient = azuriteBlobService.getContainerClient(containerName).getBlobClient(fileName)
  const download = await blobClient.download(0)
  const chunks = []
  for await (const chunk of download.readableStreamBody) {
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf-8')
}

// --- Helper: parse CSV into { headers, rows } ---
/**
 * @param {string} csv
 * @returns {{ headers: string[], rows: Record<string, string>[] }}
 */
function parseCsv (csv) {
  const lines = csv.split('\n').filter(Boolean)
  const headers = lines[0].split(',')
  const rows = lines.slice(1).map(line => {
    const cols = line.split(',')
    return Object.fromEntries(headers.map((h, i) => [h, cols[i]]))
  })
  return { headers, rows }
}

// --- Seed data ---
const VALID_ORG_EVENT = {
  partitionKey: '123456789',
  rowKey: 'org-event-1',
  EventType: 'farmerApplyData-organisation',
  SessionId: 'session-org-1',
  Status: 'active',
  Payload: JSON.stringify({
    type: 'farmerApplyData-organisation',
    message: 'Organisation data stored.',
    data: {
      reference: 'TEMP-1234-ABCD',
      organisation: {
        sbi: '123456789',
        farmerName: 'Farmer Brown',
        name: 'Brown Cow Farm',
        email: 'brown@test.com',
        orgEmail: 'brownorg@test.com',
        address: 'Yorkshire Moors AB1 1AB',
        crn: '0123456789',
        frn: '9876543210'
      }
    },
    raisedBy: 'brown@test.com',
    raisedOn: '2024-02-15T13:23:57.287Z'
  })
}

const VALID_STATUS_EVENT = {
  partitionKey: '123456789',
  rowKey: 'status-event-1',
  EventType: 'application:status-updated:1',
  SessionId: 'session-status-1',
  Status: 'active',
  Payload: JSON.stringify({
    type: 'application:status-updated:1',
    message: 'Application agreed.',
    data: { reference: 'AHWR-1234-5678', statusId: 1 },
    raisedBy: 'admin',
    raisedOn: '2024-03-01T10:00:00.000Z'
  })
}

const FILTERED_EVENT = {
  partitionKey: '123456789',
  rowKey: 'filtered-event-1',
  EventType: 'tokens-nonce',
  SessionId: 'session-filtered-1',
  Payload: JSON.stringify({
    type: 'tokens-nonce',
    message: 'Token stored.',
    data: {},
    raisedBy: 'system',
    raisedOn: '2024-03-01T10:00:00.000Z'
  })
}

const INVALID_PAYLOAD_EVENT = {
  partitionKey: '123456789',
  rowKey: 'invalid-event-1',
  EventType: 'farmerApplyData-declaration',
  SessionId: 'session-invalid-1',
  Payload: 'NOT VALID JSON {{{'
}

// --- Suite ---
describe('storage pipeline (integration)', () => {
  beforeAll(async () => {
    await seedTableClient.createTable()
    await seedTableClient.createEntity(VALID_ORG_EVENT)
    await seedTableClient.createEntity(VALID_STATUS_EVENT)
    await seedTableClient.createEntity(FILTERED_EVENT)
    await seedTableClient.createEntity(INVALID_PAYLOAD_EVENT)
    await connect(mockContext)
  })

  afterAll(async () => {
    await azuriteBlobService.getContainerClient(containerName).deleteIfExists()
    await seedTableClient.deleteTable()
  })

  afterEach(() => {
    jest.clearAllMocks()
    featureToggleConfig.poultryReleaseDate = undefined
  })

  test('CSV starts with the correct column headers', async () => {
    const fileName = `integration-headers-${Date.now()}.csv`
    await processEntitiesByTimestampPaged(fileName, mockContext)

    const csv = await readBlob(fileName)
    const { headers } = parseCsv(csv)

    expect(headers[0]).toBe('sbiFromPartitionKey')
    expect(headers[1]).toBe('sessionId')
    expect(headers[2]).toBe('eventType')
    expect(headers[3]).toBe('message')
    expect(headers).toContain('reference')
    expect(headers).toContain('statusId')
    expect(headers).toContain('statusName')
  })

  test('writes one row per valid processable event', async () => {
    const fileName = `integration-rows-${Date.now()}.csv`
    await processEntitiesByTimestampPaged(fileName, mockContext)

    const { rows } = parseCsv(await readBlob(fileName))

    // 4 seeded: 2 valid, 1 filtered (tokens-nonce), 1 invalid payload → 2 rows
    expect(rows).toHaveLength(2)
  })

  test('event data appears in the correct columns', async () => {
    const fileName = `integration-columns-${Date.now()}.csv`
    await processEntitiesByTimestampPaged(fileName, mockContext)

    const { rows } = parseCsv(await readBlob(fileName))
    const orgRow = rows.find(row => row.eventType === 'farmerApplyData-organisation')

    expect(orgRow).toBeDefined()
    expect(orgRow?.sbiFromPartitionKey).toBe('123456789')
    expect(orgRow?.farmerName).toBe('Farmer Brown')
    expect(orgRow?.reference).toBe('TEMP-1234-ABCD')
    expect(orgRow?.raisedBy).toBe('brown@test.com')
  })

  test('status events are written with correct statusId and statusName', async () => {
    const fileName = `integration-status-${Date.now()}.csv`
    await processEntitiesByTimestampPaged(fileName, mockContext)

    const { rows } = parseCsv(await readBlob(fileName))
    const statusRow = rows.find(r => r.eventType === 'application:status-updated:1')

    expect(statusRow).toBeDefined()
    expect(statusRow?.statusId).toBe('1')
    expect(statusRow?.statusName).toBe('AGREED')
  })

  test('filtered event types do not appear in the CSV', async () => {
    const fileName = `integration-filter-${Date.now()}.csv`
    await processEntitiesByTimestampPaged(fileName, mockContext)

    const csv = await readBlob(fileName)
    expect(csv).not.toContain('tokens-nonce')
  })

  test('events with invalid payloads are skipped without writing "undefined"', async () => {
    const fileName = `integration-undefined-${Date.now()}.csv`
    await processEntitiesByTimestampPaged(fileName, mockContext)

    const csv = await readBlob(fileName)
    const { rows } = parseCsv(csv)

    expect(csv).not.toContain('undefined')
    expect(rows).toHaveLength(2)
  })

  test('CSV header does not contain poultry columns when POULTRY_RELEASE_DATE is not set', async () => {
    const fileName = `integration-no-poultry-header-${Date.now()}.csv`
    await processEntitiesByTimestampPaged(fileName, mockContext)

    const { headers } = parseCsv(await readBlob(fileName))

    expect(headers).not.toContain('schemeType')
    expect(headers).not.toContain('typesOfPoultry')
    expect(headers).not.toContain('biosecurityChanges')
    expect(headers).not.toContain('biosecurityChangesCost')
    expect(headers).not.toContain('biosecurityUsefulness')
    expect(headers).not.toContain('schemeExperienceInterview')
  })

  test('CSV header contains poultry columns when POULTRY_RELEASE_DATE is set to a past date', async () => {
    featureToggleConfig.poultryReleaseDate = new Date('2020-01-01').toISOString()
    const fileName = `integration-poultry-header-${Date.now()}.csv`
    await processEntitiesByTimestampPaged(fileName, mockContext)

    const { headers } = parseCsv(await readBlob(fileName))

    expect(headers).toContain('schemeType')
    expect(headers).toContain('typesOfPoultry')
    expect(headers).toContain('biosecurityChanges')
    expect(headers).toContain('biosecurityChangesCost')
    expect(headers).toContain('biosecurityUsefulness')
    expect(headers).toContain('schemeExperienceInterview')
  })

  describe('when a poultry event is seeded', () => {
    const VALID_POULTRY_EVENT = {
      partitionKey: '123456789',
      rowKey: 'poultry-event-1',
      EventType: 'scheme-schemeType',
      SessionId: 'session-poultry-1',
      Status: 'active',
      Payload: JSON.stringify({
        type: 'scheme-schemeType',
        message: 'Session set for scheme and schemeType.',
        data: { schemeType: 'IAHW' },
        raisedBy: 'test@test.com',
        raisedOn: '2024-03-01T10:00:00.000Z'
      })
    }

    beforeAll(async () => {
      await seedTableClient.createEntity(VALID_POULTRY_EVENT)
    })

    afterAll(async () => {
      await seedTableClient.deleteEntity(VALID_POULTRY_EVENT.partitionKey, VALID_POULTRY_EVENT.rowKey)
    })

    test('poultry event appears as a data row with the correct value in the schemeType column', async () => {
      featureToggleConfig.poultryReleaseDate = new Date('2020-01-01').toISOString()
      const fileName = `integration-poultry-row-${Date.now()}.csv`
      await processEntitiesByTimestampPaged(fileName, mockContext)

      const { rows } = parseCsv(await readBlob(fileName))
      const poultryRow = rows.find(row => row.eventType === 'scheme-schemeType')

      expect(poultryRow).toBeDefined()
      expect(poultryRow?.schemeType).toBe('IAHW')
    })

    test('non-poultry and poultry events coexist correctly in the same report', async () => {
      featureToggleConfig.poultryReleaseDate = new Date('2020-01-01').toISOString()
      const fileName = `integration-coexist-${Date.now()}.csv`
      await processEntitiesByTimestampPaged(fileName, mockContext)

      const { rows } = parseCsv(await readBlob(fileName))
      const poultryRow = rows.find(row => row.eventType === 'scheme-schemeType')
      const nonPoultryRow = rows.find(row => row.eventType === 'farmerApplyData-organisation')

      expect(poultryRow).toBeDefined()
      expect(poultryRow?.schemeType).toBe('IAHW')

      expect(nonPoultryRow).toBeDefined()
      expect(nonPoultryRow?.schemeType).toBe('')
    })
  })
})
