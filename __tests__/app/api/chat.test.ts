/**
 * Chat API Route Tests
 * Comprehensive tests for /api/chat endpoint
 */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/chat/route'

// Mock dependencies
jest.mock('@/lib/utils', () => ({
  isPricingRequest: jest.fn(),
  containsProfanity: jest.fn(),
  verifyCsrfToken: jest.fn(),
  sanitizeHtml: jest.fn((text) => text),
}))

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  getClientIp: jest.fn(() => '127.0.0.1'),
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    security: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock fetch for n8n webhook
global.fetch = jest.fn()

import { isPricingRequest, containsProfanity, verifyCsrfToken, sanitizeHtml } from '@/lib/utils'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

describe('POST /api/chat', () => {
  const mockCsrfToken = verifyCsrfToken as jest.MockedFunction<typeof verifyCsrfToken>
  const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>
  const mockContainsProfanity = containsProfanity as jest.MockedFunction<typeof containsProfanity>
  const mockIsPricingRequest = isPricingRequest as jest.MockedFunction<typeof isPricingRequest>
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementations
    mockCsrfToken.mockReturnValue(true)
    mockCheckRateLimit.mockResolvedValue(true)
    mockContainsProfanity.mockReturnValue(false)
    mockIsPricingRequest.mockReturnValue(false)

    // Clear environment variables
    delete process.env.N8N_CHAT_WEBHOOK_URL
    delete process.env.N8N_CHAT_API_KEY
  })

  const createRequest = (body: any, options: { contentType?: string; origin?: string } = {}) => {
    const headers = new Headers()
    headers.set('content-type', options.contentType || 'application/json')
    if (options.origin) {
      headers.set('origin', options.origin)
    }

    return new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
  }

  describe('CSRF Protection', () => {
    it('should reject requests with invalid CSRF token', async () => {
      mockCsrfToken.mockReturnValue(false)

      const request = createRequest({ message: 'Hello', sessionId: 'test-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.blocked).toBe(true)
      expect(data.reason).toBe('csrf_validation_failed')
      expect(data.reply).toBe('Invalid request origin')
      expect(logger.security).toHaveBeenCalledWith(
        'CSRF validation failed',
        expect.objectContaining({ path: '/api/chat' })
      )
    })

    it('should accept requests with valid CSRF token', async () => {
      mockCsrfToken.mockReturnValue(true)

      const request = createRequest({ message: 'Hello', sessionId: 'test-123' })
      const response = await POST(request)

      expect(response.status).not.toBe(403)
    })
  })

  describe('Content-Type Validation', () => {
    it('should reject requests without Content-Type header', async () => {
      const request = createRequest({ message: 'Hello', sessionId: 'test-123' }, { contentType: '' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.blocked).toBe(true)
      expect(data.reason).toBe('invalid_content_type')
      expect(data.reply).toBe('Content-Type must be application/json')
    })

    it('should reject requests with wrong Content-Type', async () => {
      const request = createRequest({ message: 'Hello', sessionId: 'test-123' }, { contentType: 'text/plain' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.reason).toBe('invalid_content_type')
    })

    it('should accept application/json Content-Type', async () => {
      const request = createRequest({ message: 'Hello', sessionId: 'test-123' })
      const response = await POST(request)

      expect(response.status).not.toBe(400)
    })
  })

  describe('Input Validation', () => {
    it('should reject request with missing message', async () => {
      const request = createRequest({ sessionId: 'test-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.reply).toBe('Invalid request data.')
      expect(data.details).toBeDefined()
    })

    it('should reject request with missing sessionId', async () => {
      const request = createRequest({ message: 'Hello' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.reply).toBe('Invalid request data.')
    })

    it('should reject request with message too long', async () => {
      const longMessage = 'a'.repeat(5001)
      const request = createRequest({ message: longMessage, sessionId: 'test-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.reply).toBe('Invalid request data.')
    })

    it('should accept valid request', async () => {
      const request = createRequest({ message: 'Hello', sessionId: 'test-123' })
      const response = await POST(request)

      expect(response.status).not.toBe(400)
    })
  })

  describe('Rate Limiting', () => {
    it('should reject request when session rate limit exceeded', async () => {
      mockCheckRateLimit.mockResolvedValueOnce(false) // Session limit exceeded

      const request = createRequest({ message: 'Hello', sessionId: 'test-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.blocked).toBe(true)
      expect(data.reason).toBe('rate_limit')
      expect(data.reply).toContain('too quickly')
      expect(logger.warn).toHaveBeenCalledWith(
        'Session rate limit exceeded',
        expect.objectContaining({ sessionId: 'test-123' })
      )
    })

    it('should reject request when IP rate limit exceeded', async () => {
      mockCheckRateLimit
        .mockResolvedValueOnce(true)  // Session allowed
        .mockResolvedValueOnce(false) // IP limit exceeded

      const request = createRequest({ message: 'Hello', sessionId: 'test-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.blocked).toBe(true)
      expect(data.reason).toBe('ip_rate_limit')
      expect(data.reply).toContain('Too many requests from your network')
    })

    it('should check both session and IP rate limits', async () => {
      const request = createRequest({ message: 'Hello', sessionId: 'test-123' })
      await POST(request)

      expect(mockCheckRateLimit).toHaveBeenCalledTimes(2)
      expect(mockCheckRateLimit).toHaveBeenCalledWith('test-123')
      expect(mockCheckRateLimit).toHaveBeenCalledWith('127.0.0.1', true)
    })
  })

  describe('Profanity Filter', () => {
    it('should reject messages with profanity', async () => {
      mockContainsProfanity.mockReturnValue(true)

      const request = createRequest({ message: 'bad word', sessionId: 'test-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.blocked).toBe(true)
      expect(data.reason).toBe('profanity')
      expect(data.reply).toBe('Please keep the conversation professional.')
    })

    it('should accept clean messages', async () => {
      mockContainsProfanity.mockReturnValue(false)

      const request = createRequest({ message: 'Hello there', sessionId: 'test-123' })
      const response = await POST(request)

      expect(response.status).not.toBe(400)
    })
  })

  describe('Pricing Request Guard', () => {
    it('should block pricing requests with custom message', async () => {
      mockIsPricingRequest.mockReturnValue(true)

      const request = createRequest({ message: 'How much does it cost?', sessionId: 'test-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(data.blocked).toBe(true)
      expect(data.reason).toBe('pricing_request')
      expect(data.reply).toContain('Free AI Audit')
      expect(data.reply).toContain('pricing')
    })

    it('should allow non-pricing messages', async () => {
      mockIsPricingRequest.mockReturnValue(false)

      const request = createRequest({ message: 'What services do you offer?', sessionId: 'test-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(data.blocked).not.toBe(true)
    })
  })

  describe('N8N Webhook Integration', () => {
    beforeEach(() => {
      process.env.N8N_CHAT_WEBHOOK_URL = 'https://n8n.example.com/webhook/chat'
      process.env.N8N_CHAT_API_KEY = 'test-api-key'
    })

    it('should forward request to n8n webhook with API key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Hello from n8n',
        }),
      } as Response)

      const request = createRequest({ message: 'Hello', sessionId: 'test-123' })
      await POST(request)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://n8n.example.com/webhook/chat',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key',
          }),
          body: JSON.stringify({
            message: 'Hello',
            sessionId: 'test-123',
          }),
        })
      )
    })

    it('should return n8n response with sanitized content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Response from n8n',
          sources: ['source1', 'source2'],
          conversationId: 'conv-123',
          timestamp: '2026-01-14T00:00:00Z',
        }),
      } as Response)

      const request = createRequest({ message: 'Hello', sessionId: 'test-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.reply).toBe('Response from n8n')
      expect(data.sources).toEqual(['source1', 'source2'])
      expect(data.conversationId).toBe('conv-123')
      expect(data.timestamp).toBe('2026-01-14T00:00:00Z')
    })

    it('should limit sources to 10 items max', async () => {
      const manySources = Array.from({ length: 15 }, (_, i) => `source${i}`)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Response',
          sources: manySources,
        }),
      } as Response)

      const request = createRequest({ message: 'Hello', sessionId: 'test-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(data.sources).toHaveLength(10)
    })

    it('should handle n8n blocking response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          blocked: true,
          reason: 'pricing_request',
          reply: 'Pricing blocked',
        }),
      } as Response)

      const request = createRequest({ message: 'Hello', sessionId: 'test-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(data.blocked).toBe(true)
      expect(data.reason).toBe('pricing_request')
      expect(data.reply).toContain('Free AI Audit')
    })

    it('should fallback on n8n fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const request = createRequest({ message: 'Hello', sessionId: 'test-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.reply).toContain('automation services')
      expect(logger.warn).toHaveBeenCalledWith(
        'N8N request failed, using fallback response',
        expect.any(Object)
      )
    })

    it('should fallback on n8n non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)

      const request = createRequest({ message: 'Hello', sessionId: 'test-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.reply).toContain('automation services')
    })

    it('should fallback on invalid n8n response format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      } as Response)

      const request = createRequest({ message: 'Hello', sessionId: 'test-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.reply).toContain('automation services')
    })
  })

  describe('Default Fallback', () => {
    it('should return default response when n8n not configured', async () => {
      delete process.env.N8N_CHAT_WEBHOOK_URL

      const request = createRequest({ message: 'Hello', sessionId: 'test-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.reply).toContain('automation services')
      expect(data.reply).toContain('AI Audit')
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle JSON parsing errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'invalid json{',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.reply).toBe('An error occurred. Please try again.')
      expect(logger.error).toHaveBeenCalledWith(
        'Chat request failed',
        expect.any(Object),
        expect.any(Error)
      )
    })

    it('should handle unexpected errors', async () => {
      // Mock to throw an error during validation
      mockCheckRateLimit.mockRejectedValueOnce(new Error('Database error'))

      const request = createRequest({ message: 'Hello', sessionId: 'test-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.reply).toBe('An error occurred. Please try again.')
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete happy path', async () => {
      process.env.N8N_CHAT_WEBHOOK_URL = 'https://n8n.example.com/webhook/chat'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'We can help automate your workflow!',
        }),
      } as Response)

      const request = createRequest({
        message: 'Can you help me automate my business?',
        sessionId: 'user-session-123'
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.reply).toBe('We can help automate your workflow!')
      expect(mockCsrfToken).toHaveBeenCalled()
      expect(mockCheckRateLimit).toHaveBeenCalledTimes(2)
      expect(mockContainsProfanity).toHaveBeenCalledWith('Can you help me automate my business?')
      expect(mockIsPricingRequest).toHaveBeenCalledWith('Can you help me automate my business?')
    })

    it('should handle multiple validation failures in sequence', async () => {
      // First request: rate limited
      mockCheckRateLimit.mockResolvedValueOnce(false)
      const request1 = createRequest({ message: 'Hello', sessionId: 'test-123' })
      const response1 = await POST(request1)
      expect(response1.status).toBe(429)

      // Reset mocks
      mockCheckRateLimit.mockResolvedValue(true)

      // Second request: profanity
      mockContainsProfanity.mockReturnValue(true)
      const request2 = createRequest({ message: 'Bad word', sessionId: 'test-123' })
      const response2 = await POST(request2)
      expect(response2.status).toBe(400)
      expect((await response2.json()).reason).toBe('profanity')
    })
  })
})
