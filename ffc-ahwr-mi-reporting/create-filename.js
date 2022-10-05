const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const createFilename = () => {
  const createdDate = new Date()
  return `${createdDate.getYear()}/${month[createdDate.getMonth()]}/${createdDate.getDay()}/ahwr-mi-report.csv`
}

module.exports = createFilename
