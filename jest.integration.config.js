module.exports = {
  testMatch: ['**/test/integration/**/*.test.js'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./test/integration/setup.js'],
  verbose: true,
  transform: {
    '^.+\\.[j]sx?$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }]
      ],
      plugins: ['@babel/plugin-transform-modules-commonjs']
    }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(ffc-ahwr-common-library|uuid|@azure|@azure/data-tables|@azure/storage-blob)/)'
  ]
}
