# ffc-ahwr-mi-reporting
FFC AHWR MI reporting

## "MI-report" - Multiple agreements - IMPORTANT!

Currently, claim events associated with a specific agreement are distinguished through reference using a "claim-reference" event. Subsequently, the remaining claim events are grouped together based on the SessionId. Hence, it is crucial that two claims occur utilizing separate HTTP sessions to ensure accurate grouping.

## Local development
In order to assist with local development you can trigger the reports to run every minute.

In `function.json`, replace `"schedule": "0 0 6 * * *"` with `"schedule": "*/1 * * * *"`.

For different time triggers find this helpful website: [https://crontab.guru/](https://crontab.guru/).
