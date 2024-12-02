const pino = require('pino')

const logger = pino(
  {
    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
    formatters: {
      level: (label, number) => {
        return { level: label }
      }
    },
    transport: process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            colorize: true
          }
        }
      : undefined
  }
)

module.exports = logger
