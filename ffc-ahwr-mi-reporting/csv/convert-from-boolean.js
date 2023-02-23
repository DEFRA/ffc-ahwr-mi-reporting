const convertFromBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value === true ? 'yes' : 'no'
  }
  return value
}

module.exports = convertFromBoolean
