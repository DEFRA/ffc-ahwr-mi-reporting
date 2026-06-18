module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js',
    '!**/*.test.js'
  ],
  coverageDirectory: 'test-output',
  coverageReporters: [
    'text-summary',
    'lcov'
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/test-output/',
    '<rootDir>/test/',
    '<rootDir>/jest.config.js'
  ],
  modulePathIgnorePatterns: [
    'node_modules'
  ],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        suiteName: 'jest tests',
        outputDirectory: 'test-output',
        outputName: 'junit.xml'
      }
    ]
  ],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['test/integration'],
  setupFilesAfterEnv: ['./jest.setup.js'],
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
    '/node_modules/(?!(uuid|@azure|@azure/data-tables|@azure/storage-blob)/)'
  ]
}
