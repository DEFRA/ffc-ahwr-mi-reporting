const convertFromBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value === true ? 'Yes' : 'No'
  }
  return ''
}

module.exports = convertFromBoolean
