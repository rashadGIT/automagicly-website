/**
 * Supabase Client Tests
 * Tests for Supabase initialization and configuration
 */

describe('Supabase Client', () => {
  describe('Environment Configuration', () => {
    it('should have Supabase URL configured', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    })

    it('should have Supabase anon key configured', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
    })

    it('should have valid URL format', () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (url) {
        expect(url).toMatch(/^https?:\/\//)
      }
    })
  })

  describe('Client Initialization', () => {
    it('should create Supabase client configuration', () => {
      const config = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      }

      expect(config.url).toBeTruthy()
      expect(config.key).toBeTruthy()
    })
  })
})
