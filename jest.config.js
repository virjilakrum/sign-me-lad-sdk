/**
 * Jest Configuration
 * 
 * This file configures Jest for testing the SignMeLad SDK with real implementations
 * instead of mocks. It sets up the test environment, coverage reporting, and other
 * test-related settings.
 */

module.exports = {
  // Use TypeScript with Jest
  preset: 'ts-jest',
  
  // Default to jsdom environment but individual tests can override
  testEnvironment: 'jsdom',
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.ts?(x)', 
    '**/?(*.)+(spec|test).ts?(x)'
  ],
  
  // Collect code coverage information
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/index.ts'
  ],
  
  // Coverage thresholds to maintain
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Setup environment for tests
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  
  // Transform files using ts-jest
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  
  // Module path alias mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Verbose output for debugging
  verbose: true,
  
  // Automatic mocking is disabled
  automock: false,
  
  // Don't reset mocks between tests
  resetMocks: false,
  
  // Allow real implementations to be used
  restoreMocks: true
};
