const STORAGE_PATH = "../../../ffc-ahwr-mi-reporting/storage/storage";
const CONNECTION_STRING = "UseDevelopmentStorage=true";

const mockContext = {
  log: Object.assign(jest.fn(), { info: jest.fn(), error: jest.fn() }),
};

/**
 * Loads a fresh instance of storage.js with the local emulator feature
 * toggle switched on, and @azure/storage-blob / @azure/data-tables mocked
 * to their fromConnectionString entry points.
 * @param {{ createTableError?: any }} [options]
 */
const loadStorageWithLocalEmulator = ({ createTableError } = {}) => {
  jest.resetModules();

  process.env.USE_LOCAL_EMULATOR = "true";
  process.env.AzureWebJobsStorage = CONNECTION_STRING;

  const mockCreateTable = createTableError
    ? jest.fn().mockRejectedValue(createTableError)
    : jest.fn().mockResolvedValue(undefined);
  const mockCreateIfNotExists = jest.fn().mockResolvedValue(undefined);
  const fromConnectionStringBlob = jest.fn().mockImplementation(() => ({
    getContainerClient: jest
      .fn()
      .mockReturnValue({ createIfNotExists: mockCreateIfNotExists }),
  }));
  const fromConnectionStringTable = jest.fn().mockImplementation(() => ({
    createTable: mockCreateTable,
  }));

  jest.doMock("@azure/identity", () => ({
    DefaultAzureCredential: jest.fn(),
  }));
  jest.doMock("@azure/storage-blob", () => ({
    BlobServiceClient: { fromConnectionString: fromConnectionStringBlob },
  }));
  jest.doMock("@azure/data-tables", () => ({
    TableClient: { fromConnectionString: fromConnectionStringTable },
    odata: jest.fn(),
  }));

  const storage = require(STORAGE_PATH);

  return {
    storage,
    mockCreateTable,
    fromConnectionStringBlob,
    fromConnectionStringTable,
  };
};

describe("storage - local emulator", () => {
  afterEach(() => {
    delete process.env.USE_LOCAL_EMULATOR;
    delete process.env.AzureWebJobsStorage;
    jest.resetModules();
  });

  test("connects via AzureWebJobsStorage connection string and creates the table when it does not exist", async () => {
    const {
      storage,
      mockCreateTable,
      fromConnectionStringBlob,
      fromConnectionStringTable,
    } = loadStorageWithLocalEmulator();

    await storage.connect(mockContext);

    expect(fromConnectionStringBlob).toHaveBeenCalledWith(CONNECTION_STRING);
    expect(fromConnectionStringTable).toHaveBeenCalledWith(
      CONNECTION_STRING,
      "ahwreventstore",
      { allowInsecureConnection: true },
    );
    expect(mockCreateTable).toHaveBeenCalled();
    expect(mockContext.log.info).toHaveBeenCalledWith(
      "Created local emulator table ahwreventstore",
    );
  });

  test("does not throw when the table already exists (409 conflict)", async () => {
    const conflictError = Object.assign(new Error("conflict"), {
      statusCode: 409,
    });
    const { storage } = loadStorageWithLocalEmulator({
      createTableError: conflictError,
    });

    await expect(storage.connect(mockContext)).resolves.toBeUndefined();
  });

  test("rethrows unexpected errors from table creation", async () => {
    const unexpectedError = Object.assign(new Error("boom"), {
      statusCode: 500,
    });
    const { storage } = loadStorageWithLocalEmulator({
      createTableError: unexpectedError,
    });

    await expect(storage.connect(mockContext)).rejects.toThrow("boom");
  });
});
