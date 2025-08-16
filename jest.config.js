module.exports = {
  moduleDirectories: ['node_modules', 'src', 'src/general', 'src/dualUse'],
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  transform: {
    '^.+\\.(js|ts)$': '<rootDir>/jest.transform.js',
  },
  setupFiles: ['<rootDir>/src/__mock__/mock_extension_apis.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  automock: false,
  moduleNameMapper: {
    '^config$': '<rootDir>/src/__mock__/mock_config.js',
    '^store$': '<rootDir>/src/__mock__/mock_store.js',
    '^storage$': '<rootDir>/src/__mock__/mock_storage.js',
    '^ga$': '<rootDir>/src/__mock__/mock_ga.js',
    '^MockStoreModule$': '<rootDir>/src/__mock__/MockStoreModule.js',
    '^jitsu$': '<rootDir>/src/__mock__/mock_jitsu.js',
  },
  testEnvironment: 'jest-environment-jsdom',
};
