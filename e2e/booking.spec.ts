import { test, expect, Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { setupDefaultMocks } from './mocks/api-mocks'

// Helper function to wait for calendar and click a date
async function selectCalendarDate(page: Page) {
  await page.waitForSelector('role=grid', { timeout: 10000 })
  await expect(page.locator('text=Choose your preferred day')).toBeVisible({ timeout: 5000 })

  // With mocked API, availability loads instantly
  await page.waitForSelector('role=gridcell >> button:not([disabled])', { timeout: 5000 })
  const availableDate = page.locator('role=gridcell >> button:not([disabled])').first()

  // Wait for button to be stable
  await availableDate.waitFor({ state: 'visible', timeout: 3000 })
  await availableDate.click({ force: true })
}

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup API mocks before navigation
    await setupDefaultMocks(page)

    await page.goto('/')
    // Scroll to booking section to ensure calendar loads
    await page.locator('text=Get Your Free').first().scrollIntoViewIfNeeded()

    // Click "Talk to an Expert" to reveal the booking calendar
    await page.locator('button:has-text("Talk to an Expert")').click()
    await page.waitForTimeout(500) // Wait for animation
  })

  test('should display booking section', async ({ page }) => {
    // Verify calendar grid is visible
    await page.waitForSelector('role=grid', { timeout: 15000 })
    await expect(page.locator('role=grid').first()).toBeVisible()
  })

  test('should allow selecting a date', async ({ page }) => {
    await selectCalendarDate(page)

    // Verify time slots appear (indicates date was selected)
    await expect(page.locator('text=Select a Time')).toBeVisible({ timeout: 5000 })
  })

  test('should show time slots after selecting date', async ({ page }) => {
    await selectCalendarDate(page)

    // Wait for time slots to appear
    await page.waitForSelector('text=Select a Time', { timeout: 5000 })

    // Verify time slots are displayed
    const timeSlots = page.locator('button:has-text("AM"), button:has-text("PM")')
    await expect(timeSlots.first()).toBeVisible()
  })

  test('should show contact form after selecting time', async ({ page }) => {
    await selectCalendarDate(page)

    // Select a time slot
    await page.waitForSelector('button:has-text("AM"), button:has-text("PM")', { timeout: 5000 })
    const timeSlot = page.locator('button:has-text("AM"), button:has-text("PM")').first()
    await timeSlot.click()

    // Wait for contact form
    await page.waitForSelector('text=Your Details', { timeout: 5000 })
    await expect(page.locator('input[placeholder="John Doe"]')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await selectCalendarDate(page)

    await page.waitForSelector('button:has-text("AM"), button:has-text("PM")', { timeout: 5000 })
    const timeSlot = page.locator('button:has-text("AM"), button:has-text("PM")').first()
    await timeSlot.click()

    await page.waitForSelector('text=Your Details', { timeout: 5000 })

    // Try to submit without filling required fields
    const submitButton = page.locator('button:has-text("Confirm Booking")')
    await submitButton.click()

    // Check for HTML5 validation or error messages
    const nameInput = page.locator('input[placeholder="John Doe"]')
    const isValid = await nameInput.evaluate((el: HTMLInputElement) => el.validity.valid)
    expect(isValid).toBe(false)
  })

  test('should complete full booking flow', async ({ page }) => {
    await selectCalendarDate(page)

    // Step 2: Select time
    await page.waitForSelector('button:has-text("AM"), button:has-text("PM")', { timeout: 5000 })
    const timeSlot = page.locator('button:has-text("AM"), button:has-text("PM")').first()
    await timeSlot.click()

    // Step 3: Fill contact form
    await page.waitForSelector('text=Your Details', { timeout: 5000 })

    await page.fill('input[placeholder="John Doe"]', 'Test User')
    await page.fill('input[placeholder="john@company.com"]', 'test@example.com')
    await page.fill('input[placeholder="Acme Inc"]', 'Test Company')
    await page.fill('textarea', 'This is a test booking')

    // Step 4: Submit booking
    const submitButton = page.locator('button:has-text("Confirm Booking")')
    await submitButton.click()

    // Step 5: Verify success message
    await page.waitForSelector('text=Booking Confirmed', { timeout: 10000 })
    await expect(page.locator('text=Booking Confirmed')).toBeVisible()
    await expect(page.locator('text=test@example.com')).toBeVisible()
  })

  test('should display timezone information', async ({ page }) => {
    await selectCalendarDate(page)

    // Verify timezone is displayed
    await page.waitForSelector('text=Your timezone', { timeout: 5000 })
    await expect(page.locator('text=Your timezone')).toBeVisible()
  })

  test('should pass accessibility checks', async ({ page }) => {
    await page.waitForSelector('role=grid', { timeout: 15000 })
    await expect(page.locator('text=Choose your preferred day')).toBeVisible({ timeout: 10000 })

    // Check accessibility using AxeBuilder
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    if (process.env.CI) {
      const criticalViolations = accessibilityScanResults.violations.filter(
        (violation) => violation.impact === 'critical'
      )
      expect(criticalViolations).toEqual([])
    } else {
      expect(accessibilityScanResults.violations).toEqual([])
    }
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate and interact
    await page.goto('/')
    await page.locator('text=Get Your Free').first().scrollIntoViewIfNeeded()

    // Click "Talk to an Expert" to reveal the booking calendar
    await page.locator('button:has-text("Talk to an Expert")').click()
    await page.waitForTimeout(500) // Wait for animation

    await selectCalendarDate(page)

    // Verify time slots appear (indicates date was selected)
    await expect(page.locator('text=Select a Time')).toBeVisible({ timeout: 5000 })
  })

  test('should allow booking another session after success', async ({ page }) => {
    await selectCalendarDate(page)

    await page.waitForSelector('button:has-text("AM"), button:has-text("PM")', { timeout: 5000 })
    const timeSlot = page.locator('button:has-text("AM"), button:has-text("PM")').first()
    await timeSlot.click()

    await page.waitForSelector('text=Your Details', { timeout: 5000 })
    await page.fill('input[placeholder="John Doe"]', 'Test User')
    await page.fill('input[placeholder="john@company.com"]', 'test@example.com')
    await page.fill('input[placeholder="Acme Inc"]', 'Test Company')

    const submitButton = page.locator('button:has-text("Confirm Booking")')
    await submitButton.click()

    // Wait for success and click "Book Another Session"
    await page.waitForSelector('text=Booking Confirmed', { timeout: 10000 })
    const bookAnotherButton = page.locator('button:has-text("Book Another Session")')
    await bookAnotherButton.click()

    // Verify we're back at the booking form
    await page.waitForSelector('role=grid', { timeout: 15000 })
    await expect(page.locator('role=grid').first()).toBeVisible()
  })
})
