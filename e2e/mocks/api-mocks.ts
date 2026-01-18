import { Page } from '@playwright/test'

/**
 * Mock Google Calendar API responses for availability checks
 */
export async function mockGoogleCalendarAPI(page: Page, options?: {
  busyDates?: string[]
  shouldFail?: boolean
}) {
  const busyDates = options?.busyDates || []
  const shouldFail = options?.shouldFail || false

  await page.route('**/api/calendar/availability**', (route) => {
    if (shouldFail) {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Calendar API error' }),
      })
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ busyDates }),
      })
    }
  })
}

/**
 * Mock n8n booking webhook responses
 */
export async function mockN8NBookingWebhook(page: Page, options?: {
  shouldFail?: boolean
  delay?: number
}) {
  const shouldFail = options?.shouldFail || false
  const delay = options?.delay || 0

  // Match both test URLs and production n8n URLs
  await page.route(/.*webhook.*booking/i, async (route) => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    if (shouldFail) {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Webhook error' }),
      })
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          bookingId: 'test-booking-123',
          message: 'Booking confirmed',
        }),
      })
    }
  })
}

/**
 * Mock n8n reviews webhook responses
 */
export async function mockN8NReviewsWebhook(page: Page, options?: {
  shouldFail?: boolean
  delay?: number
}) {
  const shouldFail = options?.shouldFail || false
  const delay = options?.delay || 0

  // Match both test URLs and production n8n URLs
  await page.route(/.*webhook.*reviews/i, async (route) => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    if (shouldFail) {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Webhook error' }),
      })
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          reviewId: 'test-review-123',
          message: 'Review submitted successfully',
        }),
      })
    }
  })
}

/**
 * Mock n8n chat webhook responses
 */
export async function mockN8NChatWebhook(page: Page, options?: {
  shouldFail?: boolean
  response?: string
}) {
  const shouldFail = options?.shouldFail || false
  const response = options?.response || 'This is a test AI response.'

  // Match both test URLs and production n8n URLs
  await page.route(/.*webhook.*chat/i, (route) => {
    if (shouldFail) {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Chat API error' }),
      })
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response,
          sessionId: 'test-session-123',
        }),
      })
    }
  })
}

/**
 * Setup all common mocks for E2E tests
 * This provides a working default configuration
 */
export async function setupDefaultMocks(page: Page) {
  // Mock Google Calendar with some busy dates
  await mockGoogleCalendarAPI(page, {
    busyDates: ['2026-01-10', '2026-01-11', '2026-01-12'],
  })

  // Mock n8n webhooks with fast responses
  await mockN8NBookingWebhook(page)
  await mockN8NReviewsWebhook(page)
  await mockN8NChatWebhook(page)

  // Mock reviews API
  await mockReviewsAPI(page)

  // Mock reviews-simple API (for performance tests)
  await page.route('**/api/reviews-simple', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ reviews: [] }),
    })
  })
}

/**
 * Mock reviews API endpoint
 */
export async function mockReviewsAPI(page: Page, options?: {
  reviews?: any[]
  shouldFail?: boolean
}) {
  const shouldFail = options?.shouldFail || false
  const reviews = options?.reviews || [
    {
      id: 'review-1',
      name: 'John Doe',
      rating: 5,
      review_text: 'Excellent service!',
      service_type: 'AI Partnership',
      status: 'approved',
      created_at: Date.now() - 86400000,
    },
    {
      id: 'review-2',
      name: 'Jane Smith',
      rating: 4,
      review_text: 'Very helpful!',
      service_type: 'One-Off',
      status: 'approved',
      created_at: Date.now() - 172800000,
    },
  ]

  await page.route('**/api/reviews**', (route) => {
    if (shouldFail) {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to fetch reviews' }),
      })
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reviews }),
      })
    }
  })
}
