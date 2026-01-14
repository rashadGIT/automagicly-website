import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display booking section', async ({ page }) => {
    // Scroll to booking section or click booking link
    await page.waitForSelector('text=AI Audit', { timeout: 10000 })
  })

  test('should allow selecting a date', async ({ page }) => {
    // Wait for calendar to load
    await page.waitForSelector('.rdp', { timeout: 10000 })

    // Find an available date (not disabled)
    const availableDate = page.locator('.rdp-day:not(.rdp-day_disabled)').first()
    await availableDate.click()

    // Verify date is selected
    await expect(page.locator('.rdp-day_selected')).toBeVisible()
  })

  test('should show time slots after selecting date', async ({ page }) => {
    // Select a date
    await page.waitForSelector('.rdp', { timeout: 10000 })
    const availableDate = page.locator('.rdp-day:not(.rdp-day_disabled)').first()
    await availableDate.click()

    // Wait for time slots to appear
    await page.waitForSelector('text=Select a Time', { timeout: 5000 })

    // Verify time slots are displayed
    const timeSlots = page.locator('button:has-text("AM"), button:has-text("PM")')
    await expect(timeSlots.first()).toBeVisible()
  })

  test('should show contact form after selecting time', async ({ page }) => {
    // Select a date
    await page.waitForSelector('.rdp', { timeout: 10000 })
    const availableDate = page.locator('.rdp-day:not(.rdp-day_disabled)').first()
    await availableDate.click()

    // Select a time slot
    await page.waitForSelector('button:has-text("AM"), button:has-text("PM")', { timeout: 5000 })
    const timeSlot = page.locator('button:has-text("AM"), button:has-text("PM")').first()
    await timeSlot.click()

    // Wait for contact form
    await page.waitForSelector('text=Your Details', { timeout: 5000 })
    await expect(page.locator('input[placeholder="John Doe"]')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    // Navigate to the form
    await page.waitForSelector('.rdp', { timeout: 10000 })
    const availableDate = page.locator('.rdp-day:not(.rdp-day_disabled)').first()
    await availableDate.click()

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
    // Step 1: Select date
    await page.waitForSelector('.rdp', { timeout: 10000 })
    const availableDate = page.locator('.rdp-day:not(.rdp-day_disabled)').first()
    await availableDate.click()

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
    // Select a date
    await page.waitForSelector('.rdp', { timeout: 10000 })
    const availableDate = page.locator('.rdp-day:not(.rdp-day_disabled)').first()
    await availableDate.click()

    // Verify timezone is displayed
    await page.waitForSelector('text=Your timezone', { timeout: 5000 })
    await expect(page.locator('text=Your timezone')).toBeVisible()
  })

  test('should pass accessibility checks', async ({ page }) => {
    await page.waitForSelector('.rdp', { timeout: 10000 })

    // Check accessibility using AxeBuilder
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate and interact
    await page.goto('/')
    await page.waitForSelector('.rdp', { timeout: 10000 })

    const availableDate = page.locator('.rdp-day:not(.rdp-day_disabled)').first()
    await availableDate.click()

    // Verify calendar works on mobile
    await expect(page.locator('.rdp-day_selected')).toBeVisible()
  })

  test('should allow booking another session after success', async ({ page }) => {
    // Complete a booking first
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

    // Wait for success and click "Book Another Session"
    await page.waitForSelector('text=Booking Confirmed', { timeout: 10000 })
    const bookAnotherButton = page.locator('button:has-text("Book Another Session")')
    await bookAnotherButton.click()

    // Verify we're back at the booking form
    await page.waitForSelector('.rdp', { timeout: 5000 })
    await expect(page.locator('.rdp')).toBeVisible()
  })
})
