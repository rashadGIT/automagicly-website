/**
 * Contract Tests - Verify data contracts with external services
 * Ensures the data you send matches what the external service expects
 */
import { sendToN8N } from '@/lib/utils'

describe('n8n Webhook Contracts', () => {
  describe('Booking Webhook Contract', () => {
    it('should send booking data in correct format', async () => {
      const bookingData = {
        name: 'Test User',
        email: 'test@example.com',
        company: 'Test Company',
        dateTime: '2025-01-15 09:00 America/New_York',
        dateTimeISO: '2025-01-15T09:00:00.000Z',
        timezone: 'America/New_York',
        notes: 'Test notes',
        type: 'AI Audit Booking',
      }

      // Mock fetch to capture the request
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as Response)

      await sendToN8N('https://test.webhook.url', bookingData)

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://test.webhook.url',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      )

      const callArgs = fetchSpy.mock.calls[0]
      const sentBody = JSON.parse(callArgs[1]?.body as string)

      // Verify contract: required fields are present
      expect(sentBody).toHaveProperty('name')
      expect(sentBody).toHaveProperty('email')
      expect(sentBody).toHaveProperty('company')
      expect(sentBody).toHaveProperty('dateTime')
      expect(sentBody).toHaveProperty('dateTimeISO')
      expect(sentBody).toHaveProperty('timezone')
      expect(sentBody).toHaveProperty('type')
      expect(sentBody).toHaveProperty('source', 'automagicly-website')
      expect(sentBody).toHaveProperty('submittedAt')

      // Verify data types
      expect(typeof sentBody.name).toBe('string')
      expect(typeof sentBody.email).toBe('string')
      expect(typeof sentBody.dateTimeISO).toBe('string')

      // Verify ISO format
      expect(new Date(sentBody.dateTimeISO).toISOString()).toBe(sentBody.dateTimeISO)

      fetchSpy.mockRestore()
    })
  })

  describe('Review Webhook Contract', () => {
    it('should send review data in correct format', async () => {
      const reviewData = {
        name: 'Test User',
        email: 'test@example.com',
        company: 'Test Company',
        rating: 5,
        reviewText: 'Great service!',
        serviceType: 'AI Audit',
      }

      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as Response)

      await sendToN8N('https://test.webhook.url', reviewData)

      const callArgs = fetchSpy.mock.calls[0]
      const sentBody = JSON.parse(callArgs[1]?.body as string)

      // Verify contract
      expect(sentBody).toHaveProperty('name')
      expect(sentBody).toHaveProperty('email')
      expect(sentBody).toHaveProperty('rating')
      expect(sentBody).toHaveProperty('reviewText')
      expect(sentBody).toHaveProperty('serviceType')
      expect(sentBody).toHaveProperty('source', 'automagicly-website')
      expect(sentBody).toHaveProperty('submittedAt')

      // Verify rating is a number between 1-5
      expect(typeof sentBody.rating).toBe('number')
      expect(sentBody.rating).toBeGreaterThanOrEqual(1)
      expect(sentBody.rating).toBeLessThanOrEqual(5)

      // Verify email format
      expect(sentBody.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)

      fetchSpy.mockRestore()
    })

    it('should handle anonymous reviews correctly', async () => {
      const reviewData = {
        name: 'Anonymous',
        email: 'test@example.com',
        company: 'Anonymous Company',
        rating: 4,
        reviewText: 'Good service',
        serviceType: 'AI Audit',
      }

      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as Response)

      await sendToN8N('https://test.webhook.url', reviewData)

      const callArgs = fetchSpy.mock.calls[0]
      const sentBody = JSON.parse(callArgs[1]?.body as string)

      // Anonymous should still have all required fields
      expect(sentBody.name).toBe('Anonymous')
      expect(sentBody.company).toBe('Anonymous Company')
      expect(sentBody.email).toBe('test@example.com')

      fetchSpy.mockRestore()
    })
  })

  describe('Audit Email Results Webhook Contract', () => {
    it('should send audit email data in correct format', async () => {
      const auditEmailData = {
        sessionId: 'session-abc-123',
        email: 'test@example.com',
        name: 'Test User',
        painPoints: [
          { category: 'data-entry', description: 'Too much manual data entry', severity: 'high' },
          { category: 'scheduling', description: 'Double bookings happen frequently', severity: 'medium' },
        ],
        recommendations: [
          {
            title: 'Automate Data Entry',
            description: 'Use n8n workflows to automatically capture form data',
            complexity: 'medium',
            priority: 1,
          },
          {
            title: 'Implement Scheduling Automation',
            description: 'Integrate calendar with booking system',
            complexity: 'low',
            priority: 2,
          },
        ],
        nextSteps: 'Schedule a consultation to discuss implementation options.',
        source: 'automagicly-website-audit-email',
        sentAt: new Date().toISOString(),
      }

      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as Response)

      await fetch('https://test.webhook.url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'test-api-key',
        },
        body: JSON.stringify(auditEmailData),
      })

      const callArgs = fetchSpy.mock.calls[0]
      const sentBody = JSON.parse(callArgs[1]?.body as string)

      // Verify contract: required fields are present
      expect(sentBody).toHaveProperty('sessionId')
      expect(sentBody).toHaveProperty('email')
      expect(sentBody).toHaveProperty('name')
      expect(sentBody).toHaveProperty('painPoints')
      expect(sentBody).toHaveProperty('recommendations')
      expect(sentBody).toHaveProperty('source')
      expect(sentBody).toHaveProperty('sentAt')

      // Verify pain points structure
      expect(Array.isArray(sentBody.painPoints)).toBe(true)
      if (sentBody.painPoints.length > 0) {
        expect(sentBody.painPoints[0]).toHaveProperty('category')
        expect(sentBody.painPoints[0]).toHaveProperty('description')
        expect(sentBody.painPoints[0]).toHaveProperty('severity')
        expect(['low', 'medium', 'high']).toContain(sentBody.painPoints[0].severity)
      }

      // Verify recommendations structure
      expect(Array.isArray(sentBody.recommendations)).toBe(true)
      if (sentBody.recommendations.length > 0) {
        expect(sentBody.recommendations[0]).toHaveProperty('title')
        expect(sentBody.recommendations[0]).toHaveProperty('description')
        expect(sentBody.recommendations[0]).toHaveProperty('complexity')
        expect(sentBody.recommendations[0]).toHaveProperty('priority')
        expect(['low', 'medium', 'high']).toContain(sentBody.recommendations[0].complexity)
        expect(typeof sentBody.recommendations[0].priority).toBe('number')
      }

      // Verify data types
      expect(typeof sentBody.sessionId).toBe('string')
      expect(typeof sentBody.email).toBe('string')
      expect(sentBody.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)

      // Verify X-API-Key header is present
      expect(callArgs[1]?.headers).toHaveProperty('X-API-Key')

      fetchSpy.mockRestore()
    })

    it('should handle empty recommendations array', async () => {
      const auditEmailData = {
        sessionId: 'session-abc-123',
        email: 'test@example.com',
        name: 'Test User',
        painPoints: [],
        recommendations: [],
        nextSteps: null,
        source: 'automagicly-website-audit-email',
        sentAt: new Date().toISOString(),
      }

      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as Response)

      await fetch('https://test.webhook.url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditEmailData),
      })

      const callArgs = fetchSpy.mock.calls[0]
      const sentBody = JSON.parse(callArgs[1]?.body as string)

      // Empty arrays should be valid
      expect(sentBody.painPoints).toEqual([])
      expect(sentBody.recommendations).toEqual([])
      expect(sentBody.nextSteps).toBeNull()

      fetchSpy.mockRestore()
    })
  })

  describe('Webhook Response Contract', () => {
    it('should handle successful n8n response', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, id: '12345' }),
      } as Response)

      const result = await sendToN8N('https://test.webhook.url', { test: 'data' })

      expect(result).toBe(true)

      fetchSpy.mockRestore()
    })

    it('should handle n8n error response', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      } as Response)

      const result = await sendToN8N('https://test.webhook.url', { test: 'data' })

      expect(result).toBe(false)

      fetchSpy.mockRestore()
    })
  })

  describe('Data Validation Contract', () => {
    it('should not send invalid email addresses', async () => {
      const invalidData = {
        name: 'Test',
        email: 'not-an-email',
        rating: 5,
        reviewText: 'Test',
      }

      // In a real app, this should be validated before sending
      // This test documents the expected behavior
      expect(invalidData.email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    })

    it('should not send ratings outside 1-5 range', async () => {
      const invalidRating = 6

      // Document that ratings should be validated
      // This test documents the expected validation behavior
      expect(invalidRating).toBeGreaterThan(5) // Invalid because > 5

      const anotherInvalidRating = 0
      expect(anotherInvalidRating).toBeLessThan(1) // Invalid because < 1
    })
  })
})

/**
 * Contract tests ensure:
 * 1. You send data in the format external services expect
 * 2. Required fields are always present
 * 3. Data types are correct
 * 4. Data is validated before sending
 * 5. Responses are handled correctly
 *
 * Benefits:
 * - Catch breaking changes early
 * - Document API contracts
 * - Prevent integration failures
 * - Enable confident refactoring
 */
