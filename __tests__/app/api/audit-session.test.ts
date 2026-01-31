/**
 * Audit Session API Route Tests
 * Tests for /api/audit/session endpoint
 */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/audit/session/route'

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
}))

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  getClientIp: jest.fn(() => '127.0.0.1'),
}))

jest.mock('@/lib/audit-db', () => ({
  createAuditSession: jest.fn(),
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

import { verifyCsrfToken } from '@/lib/utils'
import { checkRateLimit } from '@/lib/rate-limit'
import { createAuditSession, getAuditSession } from '@/lib/audit-db'
import { logger } from '@/lib/logger'

describe('POST /api/audit/session', () => {
  const mockVerifyCsrfToken = verifyCsrfToken as jest.MockedFunction<typeof verifyCsrfToken>
  const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>
  const mockCreateAuditSession = createAuditSession as jest.MockedFunction<typeof createAuditSession>
  const mockGetAuditSession = getAuditSession as jest.MockedFunction<typeof getAuditSession>

  beforeEach(() => {
    jest.clearAllMocks()
    mockVerifyCsrfToken.mockReturnValue(true)
    mockCheckRateLimit.mockResolvedValue(true)
  })

  const createRequest = (body?: any, options: { contentType?: string; origin?: string } = {}) => {
    const headers: Record<string, string> = {
      'content-type': options.contentType ?? 'application/json',
    }

    if (options.origin) {
      headers['origin'] = options.origin
    }

    return new NextRequest('http://localhost:3000/api/audit/session', {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : '',
    })
  }

  it('should reject invalid CSRF tokens', async () => {
    mockVerifyCsrfToken.mockReturnValue(false)

    const request = createRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Invalid request origin')
    expect(logger.security).toHaveBeenCalled()
  })

  it('should reject invalid content type', async () => {
    const request = createRequest({ contactInfo: { name: 'Test', email: 'test@example.com' } }, {
      contentType: 'text/plain',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Content-Type')
  })

  it('should enforce rate limits', async () => {
    mockCheckRateLimit.mockResolvedValueOnce(false)

    const request = createRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toContain('Too many requests')
  })

  it('should reject invalid request body', async () => {
    const request = createRequest({ resumeSessionId: 'not-a-uuid' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request data')
    expect(data.details).toBeDefined()
  })

  it('should resume an existing session when requested', async () => {
    const existingSession = {
      sessionId: 'session-123',
      status: 'active',
      questionCount: 2,
      state: 'DISCOVERY',
      messages: [
        { role: 'assistant', content: 'Q1' },
        { role: 'user', content: 'A1' },
        { role: 'assistant', content: 'Q2' },
      ],
    }

    mockGetAuditSession.mockResolvedValueOnce(existingSession as any)

    const request = createRequest({ resumeSessionId: '11111111-1111-4111-8111-111111111111' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.sessionId).toBe('session-123')
    expect(data.question).toBe('Q2')
    expect(data.questionNumber).toBe(2)
    expect(data.state).toBe('DISCOVERY')
  })

  it('should create a new session when none exists', async () => {
    mockGetAuditSession.mockResolvedValueOnce(null)
    mockCreateAuditSession.mockResolvedValueOnce({ sessionId: 'new-session-123' } as any)

    const request = createRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.sessionId).toBe('new-session-123')
    expect(data.question).toBeDefined()
    expect(data.questionNumber).toBe(1)
  })

  it('should handle unexpected errors', async () => {
    mockCreateAuditSession.mockRejectedValueOnce(new Error('DB error'))

    const request = createRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain('Failed to create audit session')
    expect(logger.error).toHaveBeenCalled()
  })
})
