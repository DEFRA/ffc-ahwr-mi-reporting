const config = require('../config/config')

const padStart = (number) => {
  return number.toString().padStart(2, '0')
}

const createDstFoldername = () => {
  const now = new Date()
  return `${config.sharePoint.dstFolder}/${config.environment}/${now.getFullYear()}/${padStart(now.getMonth() + 1)}`
}

module.exports = createDstFoldername
