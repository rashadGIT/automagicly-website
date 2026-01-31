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
    // Exclude API routes from coverage - they require Next.js runtime and are
    // tested via E2E/Playwright tests in /e2e/ directory instead
    '!app/api/**/*.{js,jsx,ts,tsx}',
    // Exclude audit files temporarily until tests are written (feature/AIAudit branch)
    '!lib/audit-db.ts',
    '!lib/audit-types.ts',
    '!components/AIBusinessAudit.tsx',
    '!components/AuditResults.tsx',
    '!components/AuditSection.tsx',
  ],
  // Coverage thresholds - updated to reflect current baseline (Jan 2026)
  // Current: Statements 89%, Branches 79%, Functions 82%, Lines 89%
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
    // API routes are excluded because they require:
    // 1. Full Next.js runtime (NextRequest/NextResponse with nextUrl.searchParams)
    // 2. ESM modules (jose, openid-client) that Jest doesn't handle well
    // 3. Complex next-auth mocking with its OAuth dependencies
    // These are better tested via E2E/Playwright tests in /playwright/
    '/__tests__/app/api/',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
