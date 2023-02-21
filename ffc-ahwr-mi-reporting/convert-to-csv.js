const convertToCSV = (data) => {
  let csv = ''
  csv = data.map(row => Object.values(row))
  if (data.length > 0) {
    csv.unshift(Object.keys(data[0]))
  }
  return `"${csv.join('"\n"').replace(/,/g, '","')}"`
}

module.exports = convertToCSV
