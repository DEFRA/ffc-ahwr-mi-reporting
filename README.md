# ffc-ahwr-mi-reporting

FFC AHWR MI reporting

## mi-report

Each record depicts the progression of an agreement or claim's journey.

The report is generated based on events from the Azure Storage 'ahwreventstore' table (env.STORAGE_CONNECTION_STRING)

There are three distinct types of events:

-'farmerApplyData-*' events
-'claim-*' events
-'application:status-updated:<statusId>' events

'farmerApplyData-*' events are produced throughout the application journey, each time a value is stored in the user's HTTP session.
'claim-*' events are produced throughout the claim journey, each time a value is stored in the user's HTTP session.
'application:status-updated:<statusId>' events are generated at various points throughout the lifecycle of an agreement to reflect updates in its status.

!Support for multiple agreements!

Currently, claim events associated with a specific agreement are distinguished through reference using a "claim-reference" event. 
Subsequently, the remaining claim events are grouped together based on the SessionId. Hence, it is crucial that two claims occur utilizing separate HTTP sessions to ensure accurate grouping.

## Azure DevOps Pipeline

The pipeline is defined in `azure-pipelines.yml` and can be found at:
https://dev.azure.com/defragovuk/DEFRA-FFC/_build?definitionId=11321

It runs through five sequential stages: **CI → SND2 → DEV → TEST → PRE → PRD**. All deploy stages only run on the `main` branch.

### Variable Groups

Each environment has its own variable group in the Azure DevOps Library (**Pipelines → Library**). Create the following groups:

| Variable Group Name |
|---|
| `ffc-ahwr-mi-reporting-snd2` |
| `ffc-ahwr-mi-reporting-dev` |
| `ffc-ahwr-mi-reporting-test` |
| `ffc-ahwr-mi-reporting-pre` |
| `ffc-ahwr-mi-reporting-prd` |

Each group must contain the following variables. Mark secrets with the lock icon in the Azure DevOps UI.

| Variable | Secret | Description |
|---|---|---|
| `AZURE_WEB_JOBS_STORAGE` | Yes | Storage account connection string used by the Azure Functions runtime (`AzureWebJobsStorage`) |
| `STORAGE_ACCOUNT_NAME` | No | Storage account name which contains blobs and tables. Used with managed identity (`DefaultAzureCredential`) when `STORAGE_CONNECTION_STRING` is not set |
| `STORAGE_CONNECTION_STRING` | Yes | Full connection string for the storage account containing blobs and tables. Takes precedence over `STORAGE_ACCOUNT_NAME` when set |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Yes | Application Insights connection string |
| `SHAREPOINT_CLIENT_SECRET` | Yes | SharePoint app registration client secret |
| `SHAREPOINT_ENABLED` | No | Feature toggle — `true` or `false` |
| `SHAREPOINT_TENANT_ID` | No | SharePoint tenant ID |
| `SHAREPOINT_CLIENT_ID` | No | SharePoint app registration client ID |
| `SHAREPOINT_HOSTNAME` | No | e.g. `yourtenant.sharepoint.com` |
| `SHAREPOINT_SITE_PATH` | No | e.g. `/sites/yoursite` |
| `SHAREPOINT_DOCUMENT_LIBRARY` | No | SharePoint document library name |
| `SHAREPOINT_DST_FOLDER` | No | Destination folder path in SharePoint |
| `PAGE_SIZE` | No | Number of records per page — defaults to `1000` if not set |

> **Note:** Each variable group must be linked to the pipeline. In the Library, open each group and under **Pipeline permissions** add the pipeline defined above.

### Service Connections

Service connections are hardcoded per stage in `azure-pipelines.yml`:

| Stage | Service Connection |
|---|---|
| SND2 | `AZD-FFC-SND2` |
| DEV | `AZD-FFC-DEV1` |
| TEST | `AZD-FFC-DEV1` |
| PRE | `AZP-FFC-PRE1` |
| PRD | `AZR-FFC-PRD1` |

Ensure each service connection has been granted access to the pipeline under **Project Settings → Service connections → [connection name] → Security**.

## Testing

### Unit tests

Unit tests do not require any external services and can be run directly:

```bash
npm test
```

### Integration tests

Integration tests run the full pipeline end-to-end against a real [Azurite](https://github.com/Azure/Azurite) instance (Azure Storage emulator). Docker must be running before executing them.

Before running, set up your local environment:

```bash
cp .env.example .env
```

Then populate `AZURITE_KEY` in `.env` by retrieving it from the running Azurite container:

```bash
docker compose up -d
docker ps                     # find the Azurite container name
docker exec <azurite-container-name> node -e "const c = require('/usr/local/lib/node_modules/azurite/dist/src/common/utils/constants.js'); process.stdout.write(Buffer.from(c.EMULATOR_ACCOUNT_KEY).toString('base64'))"
```

Copy the output into your `.env` file as the value for `AZURITE_KEY`, then run:

```bash
npm run test:integration
docker compose down
```

Azurite runs on the following ports (mapped in `docker-compose.yaml`):

| Service | Host port |
|---------|-----------|
| Blob | 10005 |
| Queue | 10006 |
| Table | 10007 |

The following environment variables can be used to override the defaults:

| Variable | Default | Description |
|----------|---------|-------------|
| `AZURITE_KEY` | none — required | Azurite account key retrieved from the container |
| `AZURITE_ACCOUNT` | `devstoreaccount1` | Azurite account name |
| `AZURITE_HOST` | `127.0.0.1` | Azurite host |
| `AZURITE_BLOB_PORT` | `10005` | Azurite blob service port |
| `AZURITE_TABLE_PORT` | `10007` | Azurite table service port |

## Local development
In order to assist with local development you can trigger the reports to run every minute.

In `function.json`, replace `"schedule": "0 0 6 * * *"` with `"schedule": "0 * * * * *"`.

For different time triggers find this helpful website: [https://crontab.guru/](https://crontab.guru/).