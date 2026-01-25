/**
 * Auth API Route Tests
 * Tests for /api/auth/[...nextauth] handler
 */
import { GET, POST } from '@/app/api/auth/[...nextauth]/route'

jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  getAuthOptions: jest.fn(() => ({ providers: [] })),
}))

import NextAuth from 'next-auth'
import { getAuthOptions } from '@/lib/auth'

describe('Auth handler', () => {
  const mockNextAuth = NextAuth as jest.MockedFunction<typeof NextAuth>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should delegate GET requests to NextAuth', async () => {
    const handler = jest.fn().mockResolvedValue(new Response('ok'))
    mockNextAuth.mockReturnValue(handler)

    const request = new Request('http://localhost:3000/api/auth/session')
    const context = { params: { nextauth: ['session'] } }

    const response = await GET(request, context as any)

    expect(mockNextAuth).toHaveBeenCalledWith(getAuthOptions())
    expect(handler).toHaveBeenCalledWith(request, context)
    expect(await response.text()).toBe('ok')
  })

  it('should delegate POST requests to NextAuth', async () => {
    const handler = jest.fn().mockResolvedValue(new Response('ok'))
    mockNextAuth.mockReturnValue(handler)

    const request = new Request('http://localhost:3000/api/auth/session', {
      method: 'POST',
    })
    const context = { params: { nextauth: ['session'] } }

    const response = await POST(request, context as any)

    expect(mockNextAuth).toHaveBeenCalledWith(getAuthOptions())
    expect(handler).toHaveBeenCalledWith(request, context)
    expect(await response.text()).toBe('ok')
  })
})
