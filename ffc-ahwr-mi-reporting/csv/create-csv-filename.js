const createCsvFilename = (filename) => {
  const now = new Date()
  return `${filename} ${now.getFullYear()}-${('0' + (now.getMonth() + 1)).slice(-2)}-${('0' + now.getDay()).slice(-2)} ${('0' + now.getHours()).slice(-2)}${('0' + now.getMinutes()).slice(-2)}${('0' + now.getSeconds()).slice(-2)}.csv`
}

module.exports = createCsvFilename
