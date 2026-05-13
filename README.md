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
| `STORAGE_ACCOUNT_NAME` | No | Storage account name which contains blobs and tables |
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

## Local development

### Prerequisites

1. **Azure Functions Core Tools v4** — the `func` CLI.
   ```
   brew tap azure/functions
   brew install azure-functions-core-tools@4
   ```
2. **Docker** — to run Azurite (the local storage emulator). `local.settings.json` is already wired to `127.0.0.1:10005-10007`, matching `docker-compose.yaml`. Azurite only serves `AzureWebJobsStorage` (the Functions host's own bookkeeping — timer leases, etc.); it is **not** the source of the report data, which is read directly from a real Azure Storage account.
3. **Azure CLI** — install `az` and run `az login`. The application's storage clients use `DefaultAzureCredential`, which picks up your Azure CLI credentials locally. Your signed-in user needs **Storage Blob Data Contributor** and **Storage Table Data Contributor** on the target storage account.

### Steps

1. **Start Azurite**
   ```
   docker compose up -d
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Sign in to Azure**
   ```
   az login
   az account set --subscription <subscription-id>
   ```
   Use the subscription that holds the dev/snd2 storage account you intend to point at.

4. **Populate `local.settings.json`** with the env vars listed in the [Variable Groups](#variable-groups) table above. Set `STORAGE_ACCOUNT_NAME` to a real dev storage account that already contains the `ahwreventstore` table — events are read from there, not from Azurite. For local runs that don't write to SharePoint, set `SHAREPOINT_ENABLED=false`. `APPLICATIONINSIGHTS_CONNECTION_STRING` can be a dummy value.

5. **Start the function host**
   ```
   npm start
   ```
   Runs `func start -p 7081 --verbose`. Watch for the `MI Report timer trigger function started` log line.

### Triggering the function

The function is timer-triggered with a daily cron (`0 0 6 * * *`). For local testing you have two options:

- **Manual admin invoke (recommended)** — fires the function on demand without editing any files:
  ```
  curl -X POST http://localhost:7081/admin/functions/ffc-ahwr-mi-reporting \
    -H 'Content-Type: application/json' \
    -d '{}'
  ```

- **Edit the cron** — in `ffc-ahwr-mi-reporting/function.json`, temporarily replace `"schedule": "0 0 6 * * *"` with `"schedule": "0 * * * * *"` to run every minute. Don't commit this change. For other intervals see [crontab.guru](https://crontab.guru/).
