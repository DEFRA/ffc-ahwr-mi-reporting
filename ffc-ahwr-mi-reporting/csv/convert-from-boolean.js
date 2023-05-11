const convertFromBoolean = (value) => {
  if (typeof value !== 'boolean') {
    return 'no'
  }
  return value === true ? 'yes' : 'no'
}

module.exports = convertFromBoolean
