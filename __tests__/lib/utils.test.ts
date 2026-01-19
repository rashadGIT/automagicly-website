import {
  cn,
  getSessionId,
  containsProfanity,
  isPricingRequest,
  formatCurrency,
  formatNumber,
  sendToN8N,
  fetchBusyDates,
  scrollToElement,
  isAdmin,
  verifyCsrfToken,
  sanitizeHtml,
} from '@/lib/utils'
import { createMockFetch, resetMockFetch } from '../utils/mock-helpers'

describe('Utils', () => {
  describe('cn (className merge)', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', { active: true, disabled: false })).toContain('active')
      expect(cn('base', { active: true, disabled: false })).not.toContain('disabled')
    })
  })

  describe('getSessionId', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('should return existing session ID from localStorage', () => {
      const mockSessionId = 'session_123'
      localStorage.setItem('automagicly_session_id', mockSessionId)

      const sessionId = getSessionId()

      expect(sessionId).toBe(mockSessionId)
    })

    it('should generate and store new session ID if none exists', () => {
      const sessionId = getSessionId()

      // New format uses crypto.randomUUID() which produces hyphenated UUIDs
      expect(sessionId).toMatch(/^session_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
      expect(localStorage.getItem('automagicly_session_id')).toBe(sessionId)
    })

    it('should use Node randomUUID fallback when crypto.randomUUID is unavailable', () => {
      const originalCrypto = (global as any).crypto
      const originalWindow = (global as any).window
      Object.defineProperty(global, 'crypto', {
        value: undefined,
        configurable: true,
        writable: true,
      })

      jest.isolateModules(() => {
        jest.doMock('crypto', () => ({ randomUUID: () => 'fallback-uuid' }))

        const { getSessionId: getSessionIdFresh } = require('@/lib/utils')
        const sessionId = getSessionIdFresh()

        expect(sessionId).toBe('session_fallback-uuid')
      })

      Object.defineProperty(global, 'crypto', {
        value: originalCrypto,
        configurable: true,
        writable: true,
      })
      ;(global as any).window = originalWindow
      jest.dontMock('crypto')
    })
  })

  describe('containsProfanity', () => {
    it('should detect profanity in text', () => {
      // Test with actual profanity words that bad-words library detects
      expect(containsProfanity('What the fuck')).toBe(true)
      expect(containsProfanity('This is shit')).toBe(true)
    })

    it('should return false for clean text', () => {
      expect(containsProfanity('This is a nice message')).toBe(false)
      expect(containsProfanity('Hello world')).toBe(false)
      // Note: 'spam' is not a profanity word in bad-words library
      expect(containsProfanity('This is spam')).toBe(false)
    })

    it('should be case-insensitive', () => {
      expect(containsProfanity('FUCK')).toBe(true)
      expect(containsProfanity('ShIt')).toBe(true)
    })
  })

  describe('isPricingRequest', () => {
    it('should detect pricing-related keywords', () => {
      expect(isPricingRequest('How much does it cost?')).toBe(true)
      expect(isPricingRequest('What is the price?')).toBe(true)
      expect(isPricingRequest('Can you give me a quote?')).toBe(true)
      expect(isPricingRequest('I need an estimate')).toBe(true)
    })

    it('should return false for non-pricing questions', () => {
      expect(isPricingRequest('How does this work?')).toBe(false)
      expect(isPricingRequest('What features do you have?')).toBe(false)
    })

    it('should be case-insensitive', () => {
      expect(isPricingRequest('HOW MUCH does it cost?')).toBe(true)
      expect(isPricingRequest('PRICE please')).toBe(true)
    })
  })

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000')
      expect(formatCurrency(1234567)).toBe('$1,234,567')
    })

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0')
    })

    it('should not show decimals', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1234567)).toBe('1,234,567')
    })

    it('should round decimals', () => {
      expect(formatNumber(1234.56)).toBe('1,235')
    })
  })

  describe('sanitizeHtml', () => {
    it('should strip HTML content', () => {
      const result = sanitizeHtml('<b>bold</b>')
      expect(result).not.toContain('<b>')
    })
  })

  describe('sendToN8N', () => {
    beforeEach(() => {
      resetMockFetch()
    })

    it('should send data to webhook URL', async () => {
      const webhookUrl = 'https://test.webhook.url'
      const data = { name: 'Test', email: 'test@example.com' }

      createMockFetch({ success: true }, true, 200)

      const result = await sendToN8N(webhookUrl, data)

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        webhookUrl,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('test@example.com'),
        })
      )
    })

    it('should handle undefined webhook URL', async () => {
      const result = await sendToN8N(undefined, { test: 'data' })
      expect(result).toBe(true) // Returns true in demo mode
    })

    it('should handle fetch errors', async () => {
      createMockFetch({ error: 'Failed' }, false, 500)

      const result = await sendToN8N('https://test.webhook.url', { test: 'data' })

      expect(result).toBe(false)
    })

    it('should handle network failures', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network down'))

      const result = await sendToN8N('https://test.webhook.url', { test: 'data' })

      expect(result).toBe(false)
    })

    it('should include source and timestamp in payload', async () => {
      const webhookUrl = 'https://test.webhook.url'
      const data = { name: 'Test' }

      createMockFetch({ success: true }, true, 200)

      await sendToN8N(webhookUrl, data)

      const callArgs = (global.fetch as jest.Mock).mock.calls[0]
      const body = JSON.parse(callArgs[1].body)

      expect(body.source).toBe('automagicly-website')
      expect(body.submittedAt).toBeDefined()
      expect(body.name).toBe('Test')
    })
  })

  describe('fetchBusyDates', () => {
    beforeEach(() => {
      resetMockFetch()
    })

    it('should fetch and parse busy dates', async () => {
      const mockBusyDates = ['2025-01-15', '2025-01-20']
      createMockFetch({ busyDates: mockBusyDates }, true, 200)

      const result = await fetchBusyDates()

      expect(result).toHaveLength(2)
      expect(result[0]).toBeInstanceOf(Date)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/calendar/availability')
      )
    })

    it('should handle empty response', async () => {
      createMockFetch({ busyDates: [] }, true, 200)

      const result = await fetchBusyDates()

      expect(result).toEqual([])
    })

    it('should handle API errors', async () => {
      createMockFetch({ error: 'Failed to fetch' }, false, 500)

      const result = await fetchBusyDates()

      expect(result).toEqual([])
    })

    it('should handle error property in response', async () => {
      createMockFetch({ error: 'Calendar API error', busyDates: [] }, true, 200)

      const result = await fetchBusyDates()

      expect(result).toEqual([])
    })

    it('should handle request failures', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'))

      const result = await fetchBusyDates()

      expect(result).toEqual([])
    })

    it('should convert date strings to Date objects', async () => {
      const mockBusyDates = ['2025-01-15']
      createMockFetch({ busyDates: mockBusyDates }, true, 200)

      const result = await fetchBusyDates()

      expect(result[0]).toBeInstanceOf(Date)
      expect(result[0].toISOString()).toContain('2025-01-15')
    })
  })

  describe('scrollToElement', () => {
    it('should scroll to element when found', () => {
      const element = document.createElement('div')
      element.id = 'target'
      element.scrollIntoView = jest.fn()
      document.body.appendChild(element)

      scrollToElement('target')

      expect(element.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      })
      document.body.removeChild(element)
    })

    it('should do nothing when element is not found', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null as any)

      scrollToElement('missing')

      expect(document.getElementById).toHaveBeenCalledWith('missing')
      ;(document.getElementById as jest.Mock).mockRestore()
    })
  })

  describe('isAdmin', () => {
    it('should return true for admin role', () => {
      expect(isAdmin({ user: { role: 'admin' } })).toBe(true)
    })

    it('should return false for missing role', () => {
      expect(isAdmin({ user: {} })).toBe(false)
    })
  })

  describe('verifyCsrfToken', () => {
    const makeRequest = (headers: Record<string, string>) => ({
      headers: new Headers(headers),
    }) as any

    it('should accept matching origin', () => {
      const request = makeRequest({
        host: 'example.com',
        origin: 'https://example.com',
      })

      expect(verifyCsrfToken(request)).toBe(true)
    })

    it('should accept matching referer when origin is missing', () => {
      const request = makeRequest({
        host: 'example.com',
        referer: 'https://example.com/path',
      })

      expect(verifyCsrfToken(request)).toBe(true)
    })

    it('should reject when no origin or referer is present', () => {
      const request = makeRequest({
        host: 'example.com',
      })

      expect(verifyCsrfToken(request)).toBe(false)
    })
  })
})
