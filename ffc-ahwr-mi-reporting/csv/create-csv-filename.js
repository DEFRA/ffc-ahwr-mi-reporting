const padStart = (number) => {
  return number.toString().padStart(2, '0')
}

const createCsvFilename = (filename) => {
  const now = new Date()
  return `${filename} ${now.getFullYear()}-${padStart(now.getMonth() + 1)}-${padStart(now.getDate())} ${padStart(now.getHours())}${padStart(now.getMinutes())}${padStart(now.getSeconds())}.csv`
}

module.exports = createCsvFilename
