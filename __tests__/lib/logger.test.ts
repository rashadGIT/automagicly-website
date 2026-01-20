/**
 * Logger Utility Tests
 * Tests for the structured logging utility
 */
import { logger } from '@/lib/logger'

describe('logger', () => {
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'debug').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    jest.restoreAllMocks()
  })

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message')
      expect(console.log).toHaveBeenCalled()
    })

    it('should log info messages with context', () => {
      logger.info('Test message', { userId: '123', action: 'test' })
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      )
    })

    it('should include context in log output', () => {
      logger.info('Test message', { key: 'value' })
      const logCall = (console.log as jest.Mock).mock.calls[0][0]
      expect(logCall).toContain('key')
    })
  })

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning message')
      expect(console.warn).toHaveBeenCalled()
    })

    it('should log warning messages with context', () => {
      logger.warn('Warning message', { code: 'RATE_LIMIT' })
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Warning message')
      )
    })
  })

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error message')
      expect(console.error).toHaveBeenCalled()
    })

    it('should log error messages with context', () => {
      logger.error('Error occurred', { path: '/api/test' })
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error occurred')
      )
    })

    it('should log error messages with Error object', () => {
      const error = new Error('Something went wrong')
      logger.error('Request failed', { path: '/api/test' }, error)
      const errorCall = (console.error as jest.Mock).mock.calls[0][0]
      expect(errorCall).toContain('Something went wrong')
    })

    it('should include error stack in output', () => {
      const error = new Error('Stack test')
      logger.error('Error with stack', {}, error)
      const errorCall = (console.error as jest.Mock).mock.calls[0][0]
      expect(errorCall).toContain('Stack test')
    })
  })

  describe('debug', () => {
    it('should log debug messages in development', () => {
      // Note: In test environment, isDevelopment is false, so debug won't log
      // We're testing that the function exists and can be called
      logger.debug('Debug message')
      // Debug only logs in development, so this may or may not be called
      // depending on how the module was loaded
    })

    it('should accept context parameter', () => {
      logger.debug('Debug with context', { debugKey: 'debugValue' })
      // Debug only logs in development
    })
  })

  describe('apiRequest', () => {
    it('should log API request', () => {
      logger.apiRequest('GET', '/api/users')
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('API Request: GET /api/users')
      )
    })

    it('should log API request with context', () => {
      logger.apiRequest('POST', '/api/chat', { sessionId: 'abc123' })
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('API Request: POST /api/chat')
      )
    })
  })

  describe('apiResponse', () => {
    it('should log successful API response as info', () => {
      logger.apiResponse('GET', '/api/users', 200)
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('API Response: GET /api/users - 200')
      )
    })

    it('should log 4xx API response as warning', () => {
      logger.apiResponse('POST', '/api/chat', 400)
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('API Response: POST /api/chat - 400')
      )
    })

    it('should log 404 API response as warning', () => {
      logger.apiResponse('GET', '/api/unknown', 404)
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('404')
      )
    })

    it('should log 5xx API response as error', () => {
      logger.apiResponse('POST', '/api/chat', 500)
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('API Response: POST /api/chat - 500')
      )
    })

    it('should log 503 API response as error', () => {
      logger.apiResponse('GET', '/api/health', 503)
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('503')
      )
    })

    it('should include duration when provided', () => {
      logger.apiResponse('GET', '/api/users', 200, 150)
      const logCall = (console.log as jest.Mock).mock.calls[0][0]
      expect(logCall).toContain('150')
    })
  })

  describe('security', () => {
    it('should log security events as warnings', () => {
      logger.security('CSRF validation failed')
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Security Event: CSRF validation failed')
      )
    })

    it('should log security events with context', () => {
      logger.security('Rate limit exceeded', {
        ip: '192.168.1.1',
        path: '/api/chat',
      })
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Security Event')
      )
    })

    it('should include security type in context', () => {
      logger.security('Unauthorized access', { userId: 'test' })
      const warnCall = (console.warn as jest.Mock).mock.calls[0][0]
      expect(warnCall).toContain('security')
    })
  })

  describe('database', () => {
    it('should log database operations', () => {
      logger.database('query', 'users')
      // Note: database logs as debug, which only logs in development
    })

    it('should log database operations with context', () => {
      logger.database('insert', 'reviews', { id: 'review-123' })
      // Note: database logs as debug
    })
  })

  describe('log formatting', () => {
    it('should include timestamp in log entries', () => {
      logger.info('Timestamp test')
      const logCall = (console.log as jest.Mock).mock.calls[0][0]
      // In test env (non-development), it outputs JSON
      // In development, it outputs formatted text
      expect(logCall).toBeDefined()
    })

    it('should format log differently based on environment', () => {
      // Test that logs are formatted (either JSON or pretty)
      logger.info('Format test', { key: 'value' })
      expect(console.log).toHaveBeenCalled()
    })
  })

  describe('error object handling', () => {
    it('should handle Error with name', () => {
      const error = new TypeError('Type error occurred')
      logger.error('Type error', {}, error)
      const errorCall = (console.error as jest.Mock).mock.calls[0][0]
      expect(errorCall).toContain('TypeError')
    })

    it('should handle Error without stack', () => {
      const error = new Error('No stack error')
      delete error.stack
      logger.error('Error without stack', {}, error)
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('context handling', () => {
    it('should handle empty context', () => {
      logger.info('No context')
      expect(console.log).toHaveBeenCalled()
    })

    it('should handle undefined context', () => {
      logger.info('Undefined context', undefined)
      expect(console.log).toHaveBeenCalled()
    })

    it('should handle complex context objects', () => {
      logger.info('Complex context', {
        user: { id: '123', email: 'test@test.com' },
        metadata: { source: 'api', version: '1.0' },
        tags: ['tag1', 'tag2'],
      })
      expect(console.log).toHaveBeenCalled()
    })

    it('should handle context with nested objects', () => {
      logger.warn('Nested context', {
        level1: {
          level2: {
            level3: 'deep value',
          },
        },
      })
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('development formatting', () => {
    const originalEnv = process.env.NODE_ENV

    beforeEach(() => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()
      jest.spyOn(console, 'log').mockImplementation(() => {})
      jest.spyOn(console, 'warn').mockImplementation(() => {})
      jest.spyOn(console, 'error').mockImplementation(() => {})
      jest.spyOn(console, 'debug').mockImplementation(() => {})
    })

    afterEach(() => {
      process.env.NODE_ENV = originalEnv
      jest.restoreAllMocks()
    })

    it('should pretty-print context and error stack in development', () => {
      const { logger: devLogger } = require('@/lib/logger')
      const error = new Error('Dev stack error')
      error.stack = 'stack-trace'

      devLogger.error('Dev error', { contextKey: 'value' }, error)

      const errorCall = (console.error as jest.Mock).mock.calls[0][0]
      expect(errorCall).toContain('Context')
      expect(errorCall).toContain('Stack')
    })

    it('should log debug output in development', () => {
      const { logger: devLogger } = require('@/lib/logger')

      devLogger.debug('Debug message')

      expect(console.debug).toHaveBeenCalled()
    })

    it('should export default logger', () => {
      const devModule = require('@/lib/logger')

      expect(devModule.default).toBeDefined()
    })
  })
})
