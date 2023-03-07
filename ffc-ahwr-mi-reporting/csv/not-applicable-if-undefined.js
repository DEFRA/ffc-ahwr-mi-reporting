function notApplicableIfUndefined (value) {
  if (typeof value === 'undefined') {
    return 'n/a'
  }
  if (value === '') {
    return 'n/a'
  }
  return value
}

module.exports = notApplicableIfUndefined
