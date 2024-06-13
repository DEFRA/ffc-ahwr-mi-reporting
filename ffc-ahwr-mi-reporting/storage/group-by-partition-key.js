const groupByPartitionKey = (events) => {
  return events.reduce((group, event) => {
    let { partitionKey } = event
    if (partitionKey?.includes('_')) {
      partitionKey = partitionKey.split('_')[0]
    }
    group[partitionKey] = group[partitionKey] ?? []
    group[partitionKey].push(event)
    return group
  }, {})
}

module.exports = groupByPartitionKey
