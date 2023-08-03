# ffc-ahwr-mi-reporting
FFC AHWR MI reporting


## Local development
In order to assist with local development you can trigger the reports to run every minute.

In `function.json`, replace `"schedule": "0 0 6 * * *"` with `"schedule": "*/1 * * * *"`.

For different time triggers find this helpful website: [https://crontab.guru/](https://crontab.guru/).
