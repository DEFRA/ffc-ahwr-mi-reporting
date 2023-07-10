const groupByWhichReview = (groupedBySbi) => {
  return Object.entries(groupedBySbi).reduce((group, [key, value]) => {
    value.forEach((event) => {
      const eventType = event.EventType
      if (eventType === 'claim-data') {
        const whichReview = event.payload?.data?.data?.whichReview
        if (whichReview) {
          group[whichReview] = group[whichReview] ?? []
          group[whichReview].push(event)
        }
      }
    })
    return group
  }, {})
}

module.exports = groupByWhichReview
