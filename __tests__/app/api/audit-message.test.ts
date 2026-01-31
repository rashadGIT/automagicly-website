/**
 * Audit Message API Route Tests
 * Tests for /api/audit/message endpoint
 */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/audit/message/route'

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

jest.mock('@/lib/utils', () => ({
  verifyCsrfToken: jest.fn(),
  sanitizeHtml: jest.fn((text: string) => text),
}))

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  getClientIp: jest.fn(() => '127.0.0.1'),
}))

jest.mock('@/lib/audit-db', () => ({
  getAuditSession: jest.fn(),
  updateAuditSession: jest.fn(),
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    security: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}))

import { verifyCsrfToken } from '@/lib/utils'
import { checkRateLimit } from '@/lib/rate-limit'
import { getAuditSession, updateAuditSession } from '@/lib/audit-db'
import { logger } from '@/lib/logger'

describe('POST /api/audit/message', () => {
  const mockVerifyCsrfToken = verifyCsrfToken as jest.MockedFunction<typeof verifyCsrfToken>
  const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>
  const mockGetAuditSession = getAuditSession as jest.MockedFunction<typeof getAuditSession>
  const mockUpdateAuditSession = updateAuditSession as jest.MockedFunction<typeof updateAuditSession>

  beforeEach(() => {
    jest.clearAllMocks()
    mockVerifyCsrfToken.mockReturnValue(true)
    mockCheckRateLimit.mockResolvedValue(true)
  })

  const createRequest = (body: any, options: { contentType?: string; origin?: string } = {}) => {
    const headers: Record<string, string> = {
      'content-type': options.contentType ?? 'application/json',
    }

    if (options.origin) {
      headers['origin'] = options.origin
    }

    return new NextRequest('http://localhost:3000/api/audit/message', {
      method: 'POST',
      headers,
      body: options.contentType === 'application/json' || !options.contentType
        ? JSON.stringify(body)
        : (body as string),
    })
  }

  it('should reject invalid CSRF tokens', async () => {
    mockVerifyCsrfToken.mockReturnValue(false)

    const request = createRequest({ sessionId: '11111111-1111-4111-8111-111111111111', message: 'Hello' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Invalid request origin')
    expect(logger.security).toHaveBeenCalled()
  })

  it('should reject invalid content type', async () => {
    const request = createRequest('plain text', { contentType: 'text/plain' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Content-Type')
  })

  it('should reject invalid request body', async () => {
    const request = createRequest({ sessionId: 'not-a-uuid' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request data')
    expect(data.details).toBeDefined()
  })

  it('should enforce session rate limits', async () => {
    mockCheckRateLimit.mockResolvedValueOnce(false)

    const request = createRequest({ sessionId: '11111111-1111-4111-8111-111111111111', message: 'Hello' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toContain('too quickly')
  })

  it('should enforce IP rate limits', async () => {
    mockCheckRateLimit
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)

    const request = createRequest({ sessionId: '11111111-1111-4111-8111-111111111111', message: 'Hello' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toContain('Too many requests')
  })

  it('should return 404 for missing sessions', async () => {
    mockGetAuditSession.mockResolvedValueOnce(null)

    const request = createRequest({ sessionId: '11111111-1111-4111-8111-111111111111', message: 'Hello' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toContain('Session not found')
  })

  it('should reject completed sessions', async () => {
    mockGetAuditSession.mockResolvedValueOnce({
      sessionId: 'session-123',
      state: 'COMPLETE',
      questionCount: 3,
      messages: [],
      confidence: { I: 0, R: 0, P: 0, M: 0, K: 0, overall: 0 },
      painPoints: [],
      status: 'complete',
    } as any)

    const request = createRequest({ sessionId: '11111111-1111-4111-8111-111111111111', message: 'Hello' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('already ended')
  })

  it('should return next question on success', async () => {
    mockGetAuditSession.mockResolvedValueOnce({
      sessionId: 'session-123',
      state: 'DISCOVERY',
      questionCount: 1,
      messages: [
        { role: 'assistant', content: 'Q1', timestamp: Date.now() },
      ],
      confidence: { I: 0, R: 0, P: 0, M: 0, K: 0, overall: 0 },
      painPoints: [],
      status: 'active',
    } as any)

    mockUpdateAuditSession.mockResolvedValueOnce({} as any)

    const request = createRequest({ sessionId: '11111111-1111-4111-8111-111111111111', message: 'Answer' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.sessionId).toBe('11111111-1111-4111-8111-111111111111')
    expect(data.questionNumber).toBe(2)
    expect(data.state).toBe('DISCOVERY')
    expect(data.question).toBeDefined()
  })

  it('should handle unexpected errors', async () => {
    mockGetAuditSession.mockRejectedValueOnce(new Error('DB error'))

    const request = createRequest({ sessionId: '11111111-1111-4111-8111-111111111111', message: 'Hello' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain('Failed to process')
    expect(logger.error).toHaveBeenCalled()
  })
})
