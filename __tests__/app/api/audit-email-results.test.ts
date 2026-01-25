/**
 * Audit Email Results API Route Tests
 * Tests for /api/audit/email-results endpoint
 */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/audit/email-results/route'

// Store original env
const originalEnv = process.env

jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      json: (data: any, init?: any) => Response.json(data, init),
    },
  }
})

jest.mock('@/lib/audit-db', () => ({
  getAuditSession: jest.fn(),
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    security: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock global fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

import { getAuditSession } from '@/lib/audit-db'
import { logger } from '@/lib/logger'

describe('POST /api/audit/email-results', () => {
  const mockGetAuditSession = getAuditSession as jest.MockedFunction<typeof getAuditSession>

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
    // Set required env vars
    process.env = {
      ...originalEnv,
      N8N_AUDIT_EMAIL_WEBHOOK_URL: 'https://n8n.example.com/webhook/audit-email-results',
      N8N_AUDIT_AI_API_KEY: 'test-api-key',
    }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  const createRequest = (body?: any) => {
    return new NextRequest('http://localhost:3000/api/audit/email-results', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: body ? JSON.stringify(body) : '',
    })
  }

  const mockCompletedSession = {
    sessionId: 'session-123',
    state: 'COMPLETE',
    contactInfo: {
      name: 'Test User',
      email: 'test@example.com',
    },
    painPoints: [
      { category: 'data-entry', description: 'Too much manual data entry', severity: 'high' },
    ],
    recommendations: [
      { title: 'Automate data entry', description: 'Use n8n to automate', complexity: 'medium', priority: 1 },
    ],
    nextSteps: 'Schedule a consultation to discuss implementation.',
  }

  describe('Validation', () => {
    it('should reject requests without sessionId', async () => {
      const request = createRequest({})
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Session ID required')
    })

    it('should return 404 for non-existent session', async () => {
      mockGetAuditSession.mockResolvedValueOnce(null)

      const request = createRequest({ sessionId: 'non-existent-session' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Session not found')
    })

    it('should reject incomplete audit sessions', async () => {
      mockGetAuditSession.mockResolvedValueOnce({
        ...mockCompletedSession,
        state: 'DISCOVERY',
      } as any)

      const request = createRequest({ sessionId: 'session-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Audit not complete')
    })

    it('should reject sessions without email', async () => {
      mockGetAuditSession.mockResolvedValueOnce({
        ...mockCompletedSession,
        contactInfo: { name: 'Test User' }, // No email
      } as any)

      const request = createRequest({ sessionId: 'session-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No email on file')
    })
  })

  describe('Configuration errors', () => {
    it('should return 500 when webhook URL is not configured', async () => {
      delete process.env.N8N_AUDIT_EMAIL_WEBHOOK_URL
      mockGetAuditSession.mockResolvedValueOnce(mockCompletedSession as any)

      const request = createRequest({ sessionId: 'session-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Email service not configured')
      expect(logger.error).toHaveBeenCalledWith('N8N_AUDIT_EMAIL_WEBHOOK_URL not configured')
    })
  })

  describe('Successful email sending', () => {
    it('should call n8n webhook with correct payload', async () => {
      mockGetAuditSession.mockResolvedValueOnce(mockCompletedSession as any)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const request = createRequest({ sessionId: 'session-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify fetch was called with correct arguments
      expect(mockFetch).toHaveBeenCalledTimes(1)
      const [url, options] = mockFetch.mock.calls[0]
      expect(url).toBe('https://n8n.example.com/webhook/audit-email-results')
      expect(options.method).toBe('POST')
      expect(options.headers['Content-Type']).toBe('application/json')
      expect(options.headers['X-API-Key']).toBe('test-api-key')

      const body = JSON.parse(options.body)
      expect(body.sessionId).toBe('session-123')
      expect(body.email).toBe('test@example.com')
      expect(body.name).toBe('Test User')
      expect(body.painPoints).toEqual(mockCompletedSession.painPoints)
      expect(body.recommendations).toEqual(mockCompletedSession.recommendations)
      expect(body.nextSteps).toBe(mockCompletedSession.nextSteps)
      expect(body.source).toBe('automagicly-website-audit-email')
      expect(body.sentAt).toBeDefined()
    })

    it('should work without API key configured', async () => {
      delete process.env.N8N_AUDIT_AI_API_KEY
      mockGetAuditSession.mockResolvedValueOnce(mockCompletedSession as any)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const request = createRequest({ sessionId: 'session-123' })
      const response = await POST(request)

      expect(response.status).toBe(200)

      // Verify no X-API-Key header when not configured
      const [, options] = mockFetch.mock.calls[0]
      expect(options.headers['X-API-Key']).toBeUndefined()
    })

    it('should log success', async () => {
      mockGetAuditSession.mockResolvedValueOnce(mockCompletedSession as any)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const request = createRequest({ sessionId: 'session-123' })
      await POST(request)

      expect(logger.info).toHaveBeenCalledWith(
        'Audit results email sent via n8n',
        { sessionId: 'session-123', email: 'test@example.com' }
      )
    })
  })

  describe('n8n webhook errors', () => {
    it('should handle n8n webhook failure', async () => {
      mockGetAuditSession.mockResolvedValueOnce(mockCompletedSession as any)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      })

      const request = createRequest({ sessionId: 'session-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to send email')
      expect(logger.error).toHaveBeenCalledWith(
        'n8n email webhook failed',
        { status: 500, error: 'Internal server error' }
      )
    })

    it('should handle n8n webhook auth failure', async () => {
      mockGetAuditSession.mockResolvedValueOnce(mockCompletedSession as any)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      })

      const request = createRequest({ sessionId: 'session-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to send email')
    })

    it('should handle network errors', async () => {
      mockGetAuditSession.mockResolvedValueOnce(mockCompletedSession as any)
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const request = createRequest({ sessionId: 'session-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to send email')
      expect(logger.error).toHaveBeenCalled()
    })
  })

  describe('Edge cases', () => {
    it('should handle session with empty recommendations', async () => {
      mockGetAuditSession.mockResolvedValueOnce({
        ...mockCompletedSession,
        recommendations: undefined,
      } as any)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const request = createRequest({ sessionId: 'session-123' })
      const response = await POST(request)

      expect(response.status).toBe(200)

      const [, options] = mockFetch.mock.calls[0]
      const body = JSON.parse(options.body)
      expect(body.recommendations).toEqual([])
    })

    it('should handle malformed JSON in request', async () => {
      const request = new NextRequest('http://localhost:3000/api/audit/email-results', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to send email')
    })
  })
})
