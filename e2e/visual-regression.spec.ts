/**
 * Visual Regression Tests - Screenshot comparison testing
 * Detects unintended visual changes in the UI
 */
import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test('homepage should match snapshot', async ({ page }) => {
    await page.goto('/')

    // Wait for all images and fonts to load
    await page.waitForLoadState('networkidle')

    // Take screenshot of entire page
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('booking section should match snapshot', async ({ page }) => {
    await page.goto('/')

    // Wait for calendar to render
    await page.waitForSelector('.rdp', { timeout: 10000 })
    await page.waitForLoadState('networkidle')

    const bookingSection = page.locator('#booking')
    await expect(bookingSection).toHaveScreenshot('booking-section.png', {
      animations: 'disabled',
    })
  })

  test('reviews section should match snapshot', async ({ page }) => {
    await page.goto('/')
    await page.locator('#reviews').scrollIntoViewIfNeeded()
    await page.waitForLoadState('networkidle')

    const reviewsSection = page.locator('#reviews')
    await expect(reviewsSection).toHaveScreenshot('reviews-section.png', {
      animations: 'disabled',
    })
  })

  test('review form should match snapshot', async ({ page }) => {
    await page.goto('/')
    await page.locator('#reviews').scrollIntoViewIfNeeded()

    // Open review form
    await page.waitForSelector('text=Submit a Review', { timeout: 10000 })
    await page.click('button:has-text("Submit a Review")')
    await page.waitForSelector('text=Submit Your Review')

    const form = page.locator('form')
    await expect(form).toHaveScreenshot('review-form.png', {
      animations: 'disabled',
    })
  })

  test('mobile homepage should match snapshot', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('tablet homepage should match snapshot', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('booking success state should match snapshot', async ({ page }) => {
    await page.goto('/')

    // Complete booking flow
    await page.waitForSelector('.rdp', { timeout: 10000 })
    const availableDate = page.locator('.rdp-day:not(.rdp-day_disabled)').first()
    await availableDate.click()

    await page.waitForSelector('button:has-text("AM"), button:has-text("PM")', { timeout: 5000 })
    const timeSlot = page.locator('button:has-text("AM"), button:has-text("PM")').first()
    await timeSlot.click()

    await page.waitForSelector('text=Your Details', { timeout: 5000 })
    await page.fill('input[placeholder="John Doe"]', 'Test User')
    await page.fill('input[placeholder="john@company.com"]', 'test@example.com')
    await page.fill('input[placeholder="Acme Inc"]', 'Test Company')

    const submitButton = page.locator('button:has-text("Confirm Booking")')
    await submitButton.click()

    await page.waitForSelector('text=Booking Confirmed', { timeout: 10000 })

    const successMessage = page.locator('div:has-text("Booking Confirmed")').first()
    await expect(successMessage).toHaveScreenshot('booking-success.png', {
      animations: 'disabled',
    })
  })

  test('dark mode should match snapshot', async ({ page }) => {
    // Note: This assumes you have dark mode implemented
    // If not, you can skip this test or implement dark mode first
    await page.goto('/')

    // Emulate dark color scheme
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot('homepage-dark.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})

/**
 * Running visual regression tests:
 *
 * 1. First run generates baseline screenshots:
 *    npx playwright test visual-regression.spec.ts
 *
 * 2. Subsequent runs compare against baseline:
 *    npx playwright test visual-regression.spec.ts
 *
 * 3. Update snapshots when intentional changes are made:
 *    npx playwright test visual-regression.spec.ts --update-snapshots
 *
 * 4. View diff when tests fail:
 *    Open playwright-report/index.html to see visual diffs
 */
