const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const createFilename = (filename) => {
  const createdDate = new Date()
  return `${createdDate.getFullYear()}-${month[createdDate.getMonth()]}-${createdDate.getDay()}-${filename}`
}

module.exports = createFilename
