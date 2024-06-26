const statusToString = (statusId) => {
  const statusMapping = {
    1: 'AGREED',
    2: 'WITHDRAWN',
    3: 'DATA INPUTTED',
    4: 'CLAIMED',
    5: 'IN CHECK',
    6: 'ACCEPTED',
    7: 'NOT AGREED',
    8: 'PAID',
    9: 'READY TO PAY',
    10: 'REJECTED',
    11: 'ON HOLD',
    12: 'RECOMMENDED TO PAY',
    13: 'RECOMMENDED TO REJECT'
  }

  return statusMapping[statusId] ? statusMapping[statusId] : ''
}

const statusToId = (statusName) => {
  const statusMapping = {
    'Recommend to pay': 12,
    'Recommend to reject': 13
  }

  return statusMapping[statusName] ? statusMapping[statusName] : ''
}

module.exports = {
  statusToString,
  statusToId
}
