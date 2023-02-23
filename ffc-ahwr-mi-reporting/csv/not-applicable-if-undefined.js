function notApplicableIfUndefined (value) {
  if (typeof value === 'undefined') {
    return 'n/a'
  }
  return value
}

module.exports = notApplicableIfUndefined
