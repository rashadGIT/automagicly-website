const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/page.tsx',
    'app/layout.tsx',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/playwright/**',
    // Exclude test/debug API routes
    '!app/api/test-*.{js,jsx,ts,tsx}',
    '!app/api/debug-*.{js,jsx,ts,tsx}',
    '!app/api/env-*.{js,jsx,ts,tsx}',
    '!app/api/check-*.{js,jsx,ts,tsx}',
    '!app/api/direct-*.{js,jsx,ts,tsx}',
    '!app/api/seed-*.{js,jsx,ts,tsx}',
    // Exclude admin pages (not production user-facing)
    '!app/admin/**',
    '!app/calendar-diagnostic/**',
    // Exclude third-party wrappers
    '!components/CalendlyBooking.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '**/__tests__/**/*.(test|spec).[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/playwright/',
    '/e2e/',
    '/__tests__/utils/',
    '/__tests__/app/api/', // API routes need Next.js runtime, better tested with E2E
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
