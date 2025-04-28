# ffc-ahwr-mi-reporting

FFC AHWR MI reporting

## mi-report

Each record depicts the progression of an agreement's journey, commencing with the application stage and concluding at the claim stage.

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

## Local development
In order to assist with local development you can trigger the reports to run every minute.

In `function.json`, replace `"schedule": "0 0 6 * * *"` with `"schedule": "0 * * * * *"`.

For different time triggers find this helpful website: [https://crontab.guru/](https://crontab.guru/).