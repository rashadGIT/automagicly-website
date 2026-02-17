/**
 * Rate Limit Module Tests
 * Tests for DynamoDB-based rate limiting
 */
import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

// Mock AWS SDK
jest.mock('@aws-sdk/client-dynamodb')
jest.mock('@aws-sdk/util-dynamodb')

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

describe('Rate Limit Module', () => {
  const mockSend = jest.fn()
  const mockMarshall = marshall as jest.MockedFunction<typeof marshall>
  const mockUnmarshall = unmarshall as jest.MockedFunction<typeof unmarshall>

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock DynamoDB client
    ;(DynamoDBClient as jest.Mock).mockImplementation(() => ({
      send: mockSend,
    }))

    // Default implementations
    mockMarshall.mockImplementation((obj: any) => obj as any)
    mockUnmarshall.mockImplementation((obj: any) => obj as any)

    // Set up environment
    process.env.DB_ACCESS_KEY_ID = 'test-access-key'
    process.env.DB_SECRET_ACCESS_KEY = 'test-secret-key'
    process.env.REGION = 'us-east-1'
  })

  afterEach(() => {
    delete process.env.DB_ACCESS_KEY_ID
    delete process.env.DB_SECRET_ACCESS_KEY
    delete process.env.REGION
  })

  describe('checkRateLimit', () => {
    describe('Configuration', () => {
      it('should block request when DB not configured (fail closed)', async () => {
        delete process.env.DB_ACCESS_KEY_ID
        delete process.env.DB_SECRET_ACCESS_KEY

        const result = await checkRateLimit('test-identifier')

        expect(result).toBe(false)
        expect(logger.error).toHaveBeenCalledWith(
          'Rate limiting DB not configured - BLOCKING request for security'
        )
        expect(mockSend).not.toHaveBeenCalled()
      })

      it('should use default region when not specified', async () => {
        delete process.env.REGION

        mockSend.mockResolvedValueOnce({ Item: undefined })
        mockSend.mockResolvedValueOnce({})

        await checkRateLimit('test-identifier')

        expect(DynamoDBClient).toHaveBeenCalledWith(
          expect.objectContaining({
            region: 'us-east-1',
          })
        )
      })

      it('should use specified region from environment', async () => {
        process.env.REGION = 'eu-west-1'

        mockSend.mockResolvedValueOnce({ Item: undefined })
        mockSend.mockResolvedValueOnce({})

        await checkRateLimit('test-identifier')

        expect(DynamoDBClient).toHaveBeenCalledWith(
          expect.objectContaining({
            region: 'eu-west-1',
          })
        )
      })
    })

    describe('First Request (No Existing Record)', () => {
      it('should allow first request for new identifier', async () => {
        mockSend.mockResolvedValueOnce({ Item: undefined }) // GetItem returns nothing
        mockSend.mockResolvedValueOnce({}) // PutItem succeeds

        const result = await checkRateLimit('new-user-123')

        expect(result).toBe(true)
        expect(mockSend).toHaveBeenCalledTimes(2)
      })

      it('should create new rate limit record', async () => {
        const now = Date.now()
        jest.spyOn(Date, 'now').mockReturnValue(now)

        mockSend.mockResolvedValueOnce({ Item: undefined })
        mockSend.mockResolvedValueOnce({})

        await checkRateLimit('new-user-123')

        // Check PutItemCommand was called with correct data
        const putCall = mockSend.mock.calls[1][0]
        expect(putCall).toBeInstanceOf(PutItemCommand)
      })
    })

    describe('Existing Record Within Limit', () => {
      it('should allow request when under rate limit', async () => {
        const now = Date.now()
        jest.spyOn(Date, 'now').mockReturnValue(now)

        const existingRecord = {
          identifier: 'user-123',
          timestamps: [now - 30000, now - 20000], // 2 requests in last minute
          expiresAt: Math.floor((now + 60000) / 1000),
        }

        mockSend.mockResolvedValueOnce({ Item: existingRecord }) // GetItem
        mockSend.mockResolvedValueOnce({}) // PutItem

        const result = await checkRateLimit('user-123')

        expect(result).toBe(true)
      })

      it('should add current timestamp to existing timestamps', async () => {
        const now = Date.now()
        jest.spyOn(Date, 'now').mockReturnValue(now)

        const existingRecord = {
          identifier: 'user-123',
          timestamps: [now - 30000],
          expiresAt: Math.floor((now + 60000) / 1000),
        }

        mockUnmarshall.mockReturnValueOnce(existingRecord)
        mockSend.mockResolvedValueOnce({ Item: existingRecord })
        mockSend.mockResolvedValueOnce({})

        await checkRateLimit('user-123')

        // Verify marshall was called with updated timestamps
        expect(mockMarshall).toHaveBeenCalledWith(
          expect.objectContaining({
            timestamps: expect.arrayContaining([now - 30000, now]),
          })
        )
      })

      it('should filter out timestamps outside the window', async () => {
        const now = Date.now()
        jest.spyOn(Date, 'now').mockReturnValue(now)

        const existingRecord = {
          identifier: 'user-123',
          timestamps: [
            now - 120000, // 2 minutes ago (outside window)
            now - 90000,  // 1.5 minutes ago (outside window)
            now - 30000,  // 30 seconds ago (inside window)
          ],
          expiresAt: Math.floor((now + 60000) / 1000),
        }

        mockUnmarshall.mockReturnValueOnce(existingRecord)
        mockSend.mockResolvedValueOnce({ Item: existingRecord })
        mockSend.mockResolvedValueOnce({})

        await checkRateLimit('user-123')

        // Should only keep timestamps within 60 second window
        expect(mockMarshall).toHaveBeenCalledWith(
          expect.objectContaining({
            timestamps: expect.arrayContaining([now - 30000, now]),
          })
        )
      })
    })

    describe('Rate Limit Exceeded', () => {
      it('should reject request when session rate limit exceeded (10 requests)', async () => {
        const now = Date.now()
        jest.spyOn(Date, 'now').mockReturnValue(now)

        // Create 10 timestamps within the window
        const timestamps = Array.from({ length: 10 }, (_, i) => now - (i * 5000))

        const existingRecord = {
          identifier: 'user-123',
          timestamps,
          expiresAt: Math.floor((now + 60000) / 1000),
        }

        mockUnmarshall.mockReturnValueOnce(existingRecord)
        mockSend.mockResolvedValueOnce({ Item: existingRecord })

        const result = await checkRateLimit('user-123', false)

        expect(result).toBe(false)
        // Should not call PutItem when rate limited
        expect(mockSend).toHaveBeenCalledTimes(1)
      })

      it('should reject request when IP rate limit exceeded (20 requests)', async () => {
        const now = Date.now()
        jest.spyOn(Date, 'now').mockReturnValue(now)

        // Create 20 timestamps within the window
        const timestamps = Array.from({ length: 20 }, (_, i) => now - (i * 2000))

        const existingRecord = {
          identifier: '192.168.1.1',
          timestamps,
          expiresAt: Math.floor((now + 60000) / 1000),
        }

        mockUnmarshall.mockReturnValueOnce(existingRecord)
        mockSend.mockResolvedValueOnce({ Item: existingRecord })

        const result = await checkRateLimit('192.168.1.1', true)

        expect(result).toBe(false)
      })

      it('should apply different limits for session vs IP', async () => {
        const now = Date.now()
        jest.spyOn(Date, 'now').mockReturnValue(now)

        // 15 requests - exceeds session limit (10) but within IP limit (20)
        const timestamps = Array.from({ length: 15 }, (_, i) => now - (i * 3000))

        const existingRecord = {
          identifier: 'identifier',
          timestamps,
          expiresAt: Math.floor((now + 60000) / 1000),
        }

        mockUnmarshall.mockReturnValue(existingRecord)
        mockSend.mockResolvedValue({ Item: existingRecord })

        const sessionResult = await checkRateLimit('identifier', false)
        expect(sessionResult).toBe(false) // Exceeds session limit

        jest.clearAllMocks()
        mockUnmarshall.mockReturnValue(existingRecord)
        mockSend.mockResolvedValueOnce({ Item: existingRecord })
        mockSend.mockResolvedValueOnce({})

        const ipResult = await checkRateLimit('identifier', true)
        expect(ipResult).toBe(true) // Within IP limit
      })
    })

    describe('TTL Management', () => {
      it('should set expiration time correctly', async () => {
        const now = Date.now()
        jest.spyOn(Date, 'now').mockReturnValue(now)

        mockSend.mockResolvedValueOnce({ Item: undefined })
        mockSend.mockResolvedValueOnce({})

        await checkRateLimit('user-123')

        // Verify expiresAt is set to (now + 60000) / 1000
        const expectedTTL = Math.floor((now + 60000) / 1000)
        expect(mockMarshall).toHaveBeenCalledWith(
          expect.objectContaining({
            expiresAt: expectedTTL,
          })
        )
      })
    })

    describe('Error Handling', () => {
      it('should block request on DynamoDB GetItem error (fail closed)', async () => {
        mockSend.mockRejectedValueOnce(new Error('DynamoDB connection failed'))

        const result = await checkRateLimit('user-123')

        expect(result).toBe(false)
        expect(logger.error).toHaveBeenCalledWith(
          'Rate limit check failed - BLOCKING request',
          {
            identifier: 'user-123',
            failures: 1,
            isCircuitOpen: false,
          },
          expect.any(Error)
        )
      })

      it('should block request on DynamoDB PutItem error (fail closed)', async () => {
        mockSend.mockResolvedValueOnce({ Item: undefined })
        mockSend.mockRejectedValueOnce(new Error('PutItem failed'))

        const result = await checkRateLimit('user-123')

        expect(result).toBe(false)
        expect(logger.error).toHaveBeenCalled()
      })

      it('should handle malformed DynamoDB response', async () => {
        mockSend.mockResolvedValueOnce({ Item: { invalid: 'data' } })
        mockUnmarshall.mockReturnValueOnce({})
        mockSend.mockResolvedValueOnce({})

        const result = await checkRateLimit('user-123')

        expect(result).toBe(true)
      })
    })

    describe('Edge Cases', () => {
      it('should handle empty timestamps array', async () => {
        const now = Date.now()
        jest.spyOn(Date, 'now').mockReturnValue(now)

        const existingRecord = {
          identifier: 'user-123',
          timestamps: [],
          expiresAt: Math.floor((now + 60000) / 1000),
        }

        mockUnmarshall.mockReturnValueOnce(existingRecord)
        mockSend.mockResolvedValueOnce({ Item: existingRecord })
        mockSend.mockResolvedValueOnce({})

        const result = await checkRateLimit('user-123')

        expect(result).toBe(true)
      })

      it('should handle undefined timestamps', async () => {
        const existingRecord = {
          identifier: 'user-123',
          expiresAt: Date.now(),
        }

        mockUnmarshall.mockReturnValueOnce(existingRecord)
        mockSend.mockResolvedValueOnce({ Item: existingRecord })
        mockSend.mockResolvedValueOnce({})

        const result = await checkRateLimit('user-123')

        expect(result).toBe(true)
      })

      it('should handle exactly at rate limit boundary', async () => {
        const now = Date.now()
        jest.spyOn(Date, 'now').mockReturnValue(now)

        // Exactly 9 requests (one less than limit of 10)
        const timestamps = Array.from({ length: 9 }, (_, i) => now - (i * 5000))

        const existingRecord = {
          identifier: 'user-123',
          timestamps,
          expiresAt: Math.floor((now + 60000) / 1000),
        }

        mockUnmarshall.mockReturnValueOnce(existingRecord)
        mockSend.mockResolvedValueOnce({ Item: existingRecord })
        mockSend.mockResolvedValueOnce({})

        const result = await checkRateLimit('user-123', false)

        expect(result).toBe(true) // Should allow 10th request
      })
    })
  })

  describe('getClientIp', () => {
    const createMockRequest = (headers: Record<string, string>) => {
      const headersObj = new Headers()
      Object.entries(headers).forEach(([key, value]) => {
        headersObj.set(key, value)
      })
      return { headers: headersObj } as Request
    }

    it('should extract IP from x-forwarded-for header', () => {
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      })

      const ip = getClientIp(request)

      expect(ip).toBe('192.168.1.1')
    })

    it('should extract single IP from x-forwarded-for', () => {
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.1',
      })

      const ip = getClientIp(request)

      expect(ip).toBe('192.168.1.1')
    })

    it('should trim whitespace from x-forwarded-for', () => {
      const request = createMockRequest({
        'x-forwarded-for': '  192.168.1.1  , 10.0.0.1',
      })

      const ip = getClientIp(request)

      expect(ip).toBe('192.168.1.1')
    })

    it('should fallback to cf-connecting-ip when x-forwarded-for missing', () => {
      const request = createMockRequest({
        'cf-connecting-ip': '192.168.1.2',
      })

      const ip = getClientIp(request)

      expect(ip).toBe('192.168.1.2')
    })

    it('should fallback to x-real-ip when others missing', () => {
      const request = createMockRequest({
        'x-real-ip': '192.168.1.3',
      })

      const ip = getClientIp(request)

      expect(ip).toBe('192.168.1.3')
    })

    it('should return "unknown" when all headers missing', () => {
      const request = createMockRequest({})

      const ip = getClientIp(request)

      expect(ip).toBe('unknown')
    })

    it('should prioritize x-forwarded-for over other headers', () => {
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.1',
        'cf-connecting-ip': '192.168.1.2',
        'x-real-ip': '192.168.1.3',
      })

      const ip = getClientIp(request)

      expect(ip).toBe('192.168.1.1')
    })

    it('should prioritize cf-connecting-ip over x-real-ip', () => {
      const request = createMockRequest({
        'cf-connecting-ip': '192.168.1.2',
        'x-real-ip': '192.168.1.3',
      })

      const ip = getClientIp(request)

      expect(ip).toBe('192.168.1.2')
    })

    it('should handle IPv6 addresses', () => {
      const request = createMockRequest({
        'x-forwarded-for': '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
      })

      const ip = getClientIp(request)

      expect(ip).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334')
    })
  })
})
