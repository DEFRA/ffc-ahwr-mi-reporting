const groupByPartitionKey = require('../../../ffc-ahwr-mi-reporting/storage/group-by-partition-key')

describe('report', () => {
  test('should partition events', async () => {
    const events = [
      {
        partitionKey: '5432',
        EventType: 'batch-processing',
        EventRaised: '2023-02-09T17:32:57.959Z'
      },
      {
        partitionKey: '5432',
        EventType: 'batch-processing',
        EventRaised: '2023-02-09T17:32:57.959Z'
      }
    ]
    const result = groupByPartitionKey(events)
    expect(result[5432].length).toEqual(2)
  })

  test.each([
    {
      events: [
        {
          partitionKey: '5432_n/a',
          EventType: 'batch-processing',
          EventRaised: '2023-02-09T17:32:57.959Z'
        },
        {
          partitionKey: '5432_n/a',
          EventType: 'batch-processing',
          EventRaised: '2023-02-09T17:32:57.959Z'
        }
      ],
      partitionKeys: ['5432'],
      length: 2
    },
    {
      events: [
        {
          partitionKey: '66666_4444',
          EventType: 'batch-processing',
          EventRaised: '2023-02-09T17:32:57.959Z'
        },
        {
          partitionKey: '66666_4444',
          EventType: 'batch-processing',
          EventRaised: '2023-02-09T17:32:57.959Z'
        },
        {
          partitionKey: '55555_4444',
          EventType: 'batch-processing',
          EventRaised: '2023-02-09T17:32:57.959Z'
        },
        {
          partitionKey: '55555_4444',
          EventType: 'batch-processing',
          EventRaised: '2023-02-09T17:32:57.959Z'
        }
      ],
      partitionKeys: ['66666', '55555'],
      length: 2
    }
  ])('should strip _ from partition key', async (testCase) => {
    const result = groupByPartitionKey(testCase.events)
    testCase.partitionKeys.forEach(partitionKey => {
      expect(result[partitionKey].length).toEqual(testCase.length)
    })
  })
})
