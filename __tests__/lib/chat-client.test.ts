/**
 * Chat Client Tests
 * Tests for the ChatClient class and API communication
 */

// Mock environment variables before any imports
const mockEnv = {
  NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL: 'https://test.example.com/webhook/chat',
  NEXT_PUBLIC_N8N_CHAT_API_KEY: 'test-api-key-123',
}

Object.defineProperty(process.env, 'NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL', {
  value: mockEnv.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL,
  writable: true,
})
Object.defineProperty(process.env, 'NEXT_PUBLIC_N8N_CHAT_API_KEY', {
  value: mockEnv.NEXT_PUBLIC_N8N_CHAT_API_KEY,
  writable: true,
})

// Mock fetch
global.fetch = jest.fn()

describe('ChatClient', () => {
  // Import inside describe to ensure mocks are set
  let ChatClient: any

  beforeAll(() => {
    const module = require('@/lib/chat-client')
    ChatClient = module.ChatClient
  })

  const mockFetch = fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should initialize with environment variables', () => {
      expect(() => new ChatClient()).not.toThrow()
    })

    it('should throw when API configuration is missing', () => {
      const originalUrl = process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL
      const originalKey = process.env.NEXT_PUBLIC_N8N_CHAT_API_KEY

      process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL = ''
      process.env.NEXT_PUBLIC_N8N_CHAT_API_KEY = ''

      expect(() => new ChatClient()).toThrow('Chat API configuration missing')

      process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL = originalUrl
      process.env.NEXT_PUBLIC_N8N_CHAT_API_KEY = originalKey
    })

    it('should expose singleton instance', () => {
      const module = require('@/lib/chat-client')

      expect(module.chatClient).toBeInstanceOf(ChatClient)
    })
  })

  describe('sendMessage', () => {
    let client: any

    beforeEach(() => {
      client = new ChatClient()
    })

    describe('Input Validation', () => {
      it('should throw error for empty message', async () => {
        await expect(
          client.sendMessage('', 'session-123')
        ).rejects.toThrow('Message cannot be empty')
      })

      it('should throw error for message too long', async () => {
        const longMessage = 'a'.repeat(5001)

        await expect(
          client.sendMessage(longMessage, 'session-123')
        ).rejects.toThrow('Message too long (max 5000 characters)')
      })

      it('should accept message at maximum length', async () => {
        const maxMessage = 'a'.repeat(5000)

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            reply: 'Response',
            sessionId: 'session-123',
            timestamp: '2026-01-14T00:00:00Z',
          }),
        } as Response)

        await expect(
          client.sendMessage(maxMessage, 'session-123')
        ).resolves.toBeDefined()
      })

      it('should throw error for missing sessionId', async () => {
        await expect(
          client.sendMessage('Hello', '')
        ).rejects.toThrow('Session ID is required')
      })

      it('should accept valid message and sessionId', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            reply: 'Hello!',
            sessionId: 'session-123',
            timestamp: '2026-01-14T00:00:00Z',
          }),
        } as Response)

        const response = await client.sendMessage('Hello', 'session-123')

        expect(response).toBeDefined()
        expect(response.reply).toBe('Hello!')
      })
    })

    describe('API Request', () => {
      it('should make POST request with correct headers', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            reply: 'Response',
            sessionId: 'session-123',
            timestamp: '2026-01-14T00:00:00Z',
          }),
        } as Response)

        await client.sendMessage('Hello', 'session-123')

        expect(mockFetch).toHaveBeenCalledWith(
          'https://test.example.com/webhook/chat',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': 'test-api-key-123',
            },
          })
        )
      })

      it('should send message and sessionId in request body', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            reply: 'Response',
            sessionId: 'session-123',
            timestamp: '2026-01-14T00:00:00Z',
          }),
        } as Response)

        await client.sendMessage('Hello world', 'session-abc-123')

        const callArgs = mockFetch.mock.calls[0][1]
        const body = JSON.parse(callArgs?.body as string)

        expect(body).toEqual({
          message: 'Hello world',
          sessionId: 'session-abc-123',
          userEmail: 'anonymous',
        })
      })

      it('should include userEmail when provided', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            reply: 'Response',
            sessionId: 'session-123',
            timestamp: '2026-01-14T00:00:00Z',
          }),
        } as Response)

        await client.sendMessage('Hello', 'session-123', 'user@example.com')

        const callArgs = mockFetch.mock.calls[0][1]
        const body = JSON.parse(callArgs?.body as string)

        expect(body.userEmail).toBe('user@example.com')
      })

      it('should default to "anonymous" when userEmail not provided', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            reply: 'Response',
            sessionId: 'session-123',
            timestamp: '2026-01-14T00:00:00Z',
          }),
        } as Response)

        await client.sendMessage('Hello', 'session-123')

        const callArgs = mockFetch.mock.calls[0][1]
        const body = JSON.parse(callArgs?.body as string)

        expect(body.userEmail).toBe('anonymous')
      })
    })

    describe('Successful Response', () => {
      it('should return chat response on success', async () => {
        const mockResponse = {
          reply: 'This is a test response',
          sessionId: 'session-123',
          timestamp: '2026-01-14T12:00:00Z',
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response)

        const response = await client.sendMessage('Test message', 'session-123')

        expect(response).toEqual(mockResponse)
      })
    })

    describe('Error Handling', () => {
      it('should handle 429 rate limit error', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: async () => ({
            error: 'Rate limit exceeded',
            timestamp: '2026-01-14T12:00:00Z',
            retryAfter: 120,
          }),
        } as Response)

        await expect(
          client.sendMessage('Hello', 'session-123')
        ).rejects.toThrow('Rate limit exceeded. Try again in 120 seconds.')
      })

      it('should default retryAfter to 60 seconds when missing', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: async () => ({
            error: 'Rate limit exceeded',
            timestamp: '2026-01-14T12:00:00Z',
          }),
        } as Response)

        await expect(
          client.sendMessage('Hello', 'session-123')
        ).rejects.toThrow('Rate limit exceeded. Try again in 60 seconds.')
      })

      it('should handle 401 authentication error', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({
            error: 'Invalid API key',
          }),
        } as Response)

        await expect(
          client.sendMessage('Hello', 'session-123')
        ).rejects.toThrow('Authentication failed')
      })

      it('should handle 400 bad request with custom error', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({
            error: 'Message contains profanity',
          }),
        } as Response)

        await expect(
          client.sendMessage('Hello', 'session-123')
        ).rejects.toThrow('Message contains profanity')
      })

      it('should handle 400 bad request without error detail', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({}),
        } as Response)

        await expect(
          client.sendMessage('Hello', 'session-123')
        ).rejects.toThrow('Invalid request')
      })

      it('should handle 500 server error', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({
            error: 'Internal server error',
          }),
        } as Response)

        await expect(
          client.sendMessage('Hello', 'session-123')
        ).rejects.toThrow('Internal server error')
      })

      it('should handle server error without message', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({}),
        } as Response)

        await expect(
          client.sendMessage('Hello', 'session-123')
        ).rejects.toThrow('Chat service unavailable')
      })

      it('should handle network error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network connection failed'))

        await expect(
          client.sendMessage('Hello', 'session-123')
        ).rejects.toThrow('Network connection failed')
      })

      it('should handle non-Error exceptions', async () => {
        mockFetch.mockRejectedValueOnce('String error')

        await expect(
          client.sendMessage('Hello', 'session-123')
        ).rejects.toThrow('Failed to connect to chat service')
      })
    })
  })
})
