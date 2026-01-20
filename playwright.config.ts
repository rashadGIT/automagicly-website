import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. */
  reporter: process.env.CI
    ? [['html'], ['github'], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['html'], ['list']],

  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL:
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
      NEXT_PUBLIC_SITE_URL:
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      NEXTAUTH_SECRET:
        process.env.NEXTAUTH_SECRET || 'test-secret-for-playwright-32chars',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'test@example.com',
      ADMIN_PASSWORD_HASH:
        process.env.ADMIN_PASSWORD_HASH || '$2a$10$test.hash.for.playwright',
      DB_ACCESS_KEY_ID: process.env.DB_ACCESS_KEY_ID || 'test-key',
      DB_SECRET_ACCESS_KEY: process.env.DB_SECRET_ACCESS_KEY || 'test-secret',
      GOOGLE_SERVICE_ACCOUNT_EMAIL:
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
        'test@test.iam.gserviceaccount.com',
      GOOGLE_PRIVATE_KEY:
        process.env.GOOGLE_PRIVATE_KEY ||
        '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----',
      GOOGLE_CALENDAR_ID:
        process.env.GOOGLE_CALENDAR_ID || 'test@group.calendar.google.com',
    },
  },
});
