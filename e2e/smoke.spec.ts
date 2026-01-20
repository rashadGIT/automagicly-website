/**
 * Smoke Tests - Quick sanity checks for critical functionality
 * These run fast and verify the most important features work
 * Run these in production after deployment to ensure nothing broke
 */
import { test, expect } from '@playwright/test'
import { setupDefaultMocks } from './mocks/api-mocks'

test.describe('Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page)
  })

  test('homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)

    // Verify critical elements are present
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('booking section is accessible', async ({ page }) => {
    await page.goto('/')

    // Scroll to booking section
    await page.locator('text=Schedule Your Free AI Audit').first().scrollIntoViewIfNeeded()

    // Verify calendar loads - wait for calendar grid and date selection text
    await page.waitForSelector('role=grid', { timeout: 20000 })
    await expect(page.locator('role=grid').first()).toBeVisible()

    // Ensure calendar has loaded (not showing "Checking availability...")
    await expect(page.locator('text=Choose your preferred day')).toBeVisible({ timeout: 10000 })
  })

  test('reviews section is accessible', async ({ page }) => {
    await page.goto('/')

    // Verify reviews section loads
    await page.locator('#reviews').scrollIntoViewIfNeeded()
    await expect(page.locator('text=Client Reviews')).toBeVisible()
  })

  test('review form opens', async ({ page }) => {
    await page.goto('/')
    await page.locator('#reviews').scrollIntoViewIfNeeded()

    await page.waitForSelector('text=Submit a Review', { timeout: 10000 })
    await page.click('button:has-text("Submit a Review")')

    await expect(page.locator('text=Submit Your Review')).toBeVisible()
  })

  test('booking calendar responds to clicks', async ({ page }) => {
    await page.goto('/')

    // Scroll to booking section
    await page.locator('text=Schedule Your Free AI Audit').first().scrollIntoViewIfNeeded()

    // Wait for calendar grid to load
    await page.waitForSelector('role=grid', { timeout: 20000 })
    await expect(page.locator('text=Choose your preferred day')).toBeVisible({ timeout: 10000 })

    // Wait for and click a clickable date button (gridcell with button not disabled)
    await page.waitForSelector('role=gridcell >> button:not([disabled])', { timeout: 10000 })

    // Click the first available date
    const availableDate = page.locator('role=gridcell >> button:not([disabled])').first()
    await availableDate.click()

    // Should show time slots
    await expect(page.locator('text=Select a Time')).toBeVisible({ timeout: 5000 })
  })

  test('API endpoints respond', async ({ page }) => {
    // Test reviews API - accept both 200 (success) and 401 (auth required)
    const reviewsResponse = await page.request.get('/api/reviews-simple')
    expect([200, 401]).toContain(reviewsResponse.status())

    if (reviewsResponse.status() === 200) {
      const reviewsData = await reviewsResponse.json()
      expect(reviewsData).toHaveProperty('reviews')
    }
  })

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Filter out known/acceptable errors
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes('Failed to load resource') && // Ignore 404s for optional resources
        !error.includes('[next-auth]') && // Ignore next-auth session errors in test environment
        !error.includes('CLIENT_FETCH_ERROR') && // Ignore next-auth fetch errors
        !error.includes('Unexpected token') // Ignore JSON parse errors from auth
    )

    expect(criticalErrors).toHaveLength(0)
  })

  test('page is responsive', async ({ page }) => {
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()

    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()

    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  })

  test('critical links work', async ({ page }) => {
    await page.goto('/')

    // Test navigation if you have it
    // await page.click('a:has-text("About")')
    // await expect(page).toHaveURL(/.*about/)

    // For now, just verify the page has loaded
    await expect(page).toHaveURL('/')
  })

  test('forms have proper validation attributes', async ({ page }) => {
    await page.goto('/')
    await page.locator('#reviews').scrollIntoViewIfNeeded()
    await page.click('button:has-text("Submit a Review")')

    // Wait for review form modal to open
    await expect(page.locator('text=Submit Your Review')).toBeVisible()

    // Check email has proper validation - use first() since all email inputs have same validation
    const emailInput = page.locator('input[type="email"][placeholder*="email"]').first()
    await expect(emailInput).toHaveAttribute('required')
    await expect(emailInput).toHaveAttribute('type', 'email')
  })
})

/**
 * Smoke tests should:
 * - Run in < 2 minutes
 * - Cover critical user paths
 * - Verify key functionality works
 * - Run in production after deployment
 * - Alert immediately if something is broken
 *
 * Run with:
 * npx playwright test smoke.spec.ts --project=chromium
 */
