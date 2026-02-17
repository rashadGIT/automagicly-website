// Standalone Jest config using @swc/jest to fix SWC binding issues
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testTimeout: 10000,

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Module resolution
  moduleNameMapper: {
    // Mock CSS/style imports (must be before path aliases)
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Use @swc/jest for transformation (fixes SWC binding issues)
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', {
      jsc: {
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
      },
    }],
  },

  transformIgnorePatterns: [
    'node_modules/(?!(bad-words|badwords-list)/)',
  ],

  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/page.tsx',
    'app/layout.tsx',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/playwright/**',
    '!app/api/test-*.{js,jsx,ts,tsx}',
    '!app/api/debug-*.{js,jsx,ts,tsx}',
    '!app/api/env-*.{js,jsx,ts,tsx}',
    '!app/api/check-*.{js,jsx,ts,tsx}',
    '!app/api/direct-*.{js,jsx,ts,tsx}',
    '!app/api/seed-*.{js,jsx,ts,tsx}',
    '!app/admin/**',
    '!app/calendar-diagnostic/**',
    '!components/CalendlyBooking.tsx',
    '!components/ErrorBoundary.tsx',
    '!components/AIBusinessAudit.tsx',
    '!components/AuditResults.tsx',
    '!components/AuditSection.tsx',
    '!components/audit/**/*.tsx',
    '!app/api/**/*.{js,jsx,ts,tsx}',
    '!lib/audit-db.ts',
    '!lib/audit-types.ts',
    '!lib/errors.ts',
    '!lib/constants.ts',
  ],

  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 85,
      statements: 85,
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
    '/__tests__/app/api/',
  ],
}
