module.exports = (statusId) => {
  if (statusId === 1) {
    return 'AGREED'
  } else if (statusId === 2) {
    return 'WITHDRAWN'
  } else if (statusId === 3) {
    return 'DATA INPUTTED'
  } else if (statusId === 4) {
    return 'CLAIMED'
  } else if (statusId === 5) {
    return 'IN CHECK'
  } else if (statusId === 6) {
    return 'ACCEPTED'
  } else if (statusId === 7) {
    return 'NOT AGREED'
  } else if (statusId === 8) {
    return 'PAID'
  } else if (statusId === 9) {
    return 'READY TO PAY'
  } else if (statusId === 10) {
    return 'REJECTED'
  } else if (statusId === 11) {
    return 'ON HOLD'
  } else if (statusId === 12) {
    return 'RECOMMENDED TO PAY'
  } else if (statusId === 13) {
    return 'RECOMMENDED TO REJECT'
  } else {
    return ''
  }
}
