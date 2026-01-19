/**
 * Environment Validator Tests
 * Tests for the environment variable validation utility
 */
import {
  validateEnvironmentVariables,
  validateServerEnv,
  isProduction,
  isDevelopment,
  isTest,
} from '@/lib/env-validator'

describe('env-validator', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    // Set minimum required env vars for tests
    process.env.NEXTAUTH_SECRET = 'a'.repeat(32)
    process.env.ADMIN_EMAIL = 'admin@test.com'
    process.env.ADMIN_PASSWORD_HASH = 'hashedpassword'
    process.env.DB_ACCESS_KEY_ID = 'test-key'
    process.env.DB_SECRET_ACCESS_KEY = 'test-secret'
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'service@test.iam.gserviceaccount.com'
    process.env.GOOGLE_PRIVATE_KEY = 'test-private-key'
    process.env.GOOGLE_CALENDAR_ID = 'test-calendar-id'
    process.env.NODE_ENV = 'test'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('validateEnvironmentVariables', () => {
    it('should pass with all required variables set', () => {
      expect(() => validateEnvironmentVariables()).not.toThrow()
    })

    it('should throw error when NEXTAUTH_SECRET is missing', () => {
      delete process.env.NEXTAUTH_SECRET
      expect(() => validateEnvironmentVariables()).toThrow(/NEXTAUTH_SECRET/)
    })

    it('should throw error when NEXTAUTH_SECRET is too short', () => {
      process.env.NEXTAUTH_SECRET = 'short'
      expect(() => validateEnvironmentVariables()).toThrow(/at least 32 characters/)
    })

    it('should throw error when NEXTAUTH_URL is missing in production', () => {
      process.env.NODE_ENV = 'production'
      delete process.env.NEXTAUTH_URL
      expect(() => validateEnvironmentVariables()).toThrow(/NEXTAUTH_URL/)
    })

    it('should not require NEXTAUTH_URL in development', () => {
      process.env.NODE_ENV = 'development'
      delete process.env.NEXTAUTH_URL
      expect(() => validateEnvironmentVariables()).not.toThrow()
    })

    it('should throw error when ADMIN_EMAIL is missing', () => {
      delete process.env.ADMIN_EMAIL
      expect(() => validateEnvironmentVariables()).toThrow(/ADMIN_EMAIL/)
    })

    it('should throw error when ADMIN_PASSWORD_HASH is missing', () => {
      delete process.env.ADMIN_PASSWORD_HASH
      expect(() => validateEnvironmentVariables()).toThrow(/ADMIN_PASSWORD_HASH/)
    })

    it('should throw error when DB_ACCESS_KEY_ID is missing', () => {
      delete process.env.DB_ACCESS_KEY_ID
      expect(() => validateEnvironmentVariables()).toThrow(/DB_ACCESS_KEY_ID/)
    })

    it('should throw error when DB_SECRET_ACCESS_KEY is missing', () => {
      delete process.env.DB_SECRET_ACCESS_KEY
      expect(() => validateEnvironmentVariables()).toThrow(/DB_SECRET_ACCESS_KEY/)
    })

    it('should throw error when GOOGLE_SERVICE_ACCOUNT_EMAIL is missing', () => {
      delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
      expect(() => validateEnvironmentVariables()).toThrow(/GOOGLE_SERVICE_ACCOUNT_EMAIL/)
    })

    it('should throw error when GOOGLE_PRIVATE_KEY is missing', () => {
      delete process.env.GOOGLE_PRIVATE_KEY
      expect(() => validateEnvironmentVariables()).toThrow(/GOOGLE_PRIVATE_KEY/)
    })

    it('should throw error when GOOGLE_CALENDAR_ID is missing', () => {
      delete process.env.GOOGLE_CALENDAR_ID
      expect(() => validateEnvironmentVariables()).toThrow(/GOOGLE_CALENDAR_ID/)
    })

    it('should throw error with multiple missing variables', () => {
      delete process.env.ADMIN_EMAIL
      delete process.env.DB_ACCESS_KEY_ID

      try {
        validateEnvironmentVariables()
        fail('Expected error to be thrown')
      } catch (error: any) {
        expect(error.message).toContain('ADMIN_EMAIL')
        expect(error.message).toContain('DB_ACCESS_KEY_ID')
      }
    })

    it('should log warnings for optional missing variables', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      delete process.env.REGION

      validateEnvironmentVariables()

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Environment Variable Warnings')
      )
      warnSpy.mockRestore()
    })

    it('should warn about missing Sentry DSN in production', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      process.env.NODE_ENV = 'production'
      process.env.NEXTAUTH_URL = 'https://example.com'
      delete process.env.NEXT_PUBLIC_SENTRY_DSN

      validateEnvironmentVariables()

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('NEXT_PUBLIC_SENTRY_DSN')
      )
      warnSpy.mockRestore()
    })

    it('should log success message in development', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
      process.env.NODE_ENV = 'development'

      validateEnvironmentVariables()

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('All required environment variables are set')
      )
      logSpy.mockRestore()
    })

    it('should not log success message in production', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
      process.env.NODE_ENV = 'production'
      process.env.NEXTAUTH_URL = 'https://example.com'

      validateEnvironmentVariables()

      expect(logSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('All required environment variables are set')
      )
      logSpy.mockRestore()
    })
  })

  describe('validateServerEnv', () => {
    it('should pass when all required variables exist', () => {
      process.env.CUSTOM_VAR = 'value'
      expect(() => validateServerEnv(['CUSTOM_VAR'])).not.toThrow()
    })

    it('should throw when required variable is missing', () => {
      delete process.env.CUSTOM_VAR
      expect(() => validateServerEnv(['CUSTOM_VAR'])).toThrow(/CUSTOM_VAR/)
    })

    it('should throw with multiple missing variables', () => {
      delete process.env.VAR_A
      delete process.env.VAR_B

      try {
        validateServerEnv(['VAR_A', 'VAR_B'])
        fail('Expected error to be thrown')
      } catch (error: any) {
        expect(error.message).toContain('VAR_A')
        expect(error.message).toContain('VAR_B')
      }
    })

    it('should pass with empty array', () => {
      expect(() => validateServerEnv([])).not.toThrow()
    })
  })

  describe('isProduction', () => {
    it('should return true when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production'
      expect(isProduction()).toBe(true)
    })

    it('should return false when NODE_ENV is not production', () => {
      process.env.NODE_ENV = 'development'
      expect(isProduction()).toBe(false)
    })

    it('should return false when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test'
      expect(isProduction()).toBe(false)
    })
  })

  describe('isDevelopment', () => {
    it('should return true when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development'
      expect(isDevelopment()).toBe(true)
    })

    it('should return false when NODE_ENV is not development', () => {
      process.env.NODE_ENV = 'production'
      expect(isDevelopment()).toBe(false)
    })

    it('should return false when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test'
      expect(isDevelopment()).toBe(false)
    })
  })

  describe('isTest', () => {
    it('should return true when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test'
      expect(isTest()).toBe(true)
    })

    it('should return false when NODE_ENV is not test', () => {
      process.env.NODE_ENV = 'production'
      expect(isTest()).toBe(false)
    })

    it('should return false when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development'
      expect(isTest()).toBe(false)
    })
  })
})
