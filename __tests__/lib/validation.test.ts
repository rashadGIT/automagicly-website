import {
  reviewUpdateSchema,
  reviewDeleteSchema,
  reviewQuerySchema,
  chatMessageSchema,
  bookingQuerySchema,
  emailSchema,
  ratingSchema,
  reviewSubmissionSchema,
} from '@/lib/validation'

describe('validation schemas', () => {
  describe('review ID validation', () => {
    it('should accept UUID format', () => {
      const result = reviewDeleteSchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174000',
      })

      expect(result.success).toBe(true)
    })

    it('should accept DynamoDB review format', () => {
      const result = reviewDeleteSchema.safeParse({
        id: 'review-1234567890-42',
      })

      expect(result.success).toBe(true)
    })

    it('should reject invalid review IDs', () => {
      const result = reviewDeleteSchema.safeParse({ id: 'not-a-valid-id' })

      expect(result.success).toBe(false)
    })
  })

  describe('reviewUpdateSchema', () => {
    it('should require status or featured', () => {
      const result = reviewUpdateSchema.safeParse({
        id: 'review-1-2',
      })

      expect(result.success).toBe(false)
    })

    it('should accept status updates', () => {
      const result = reviewUpdateSchema.safeParse({
        id: 'review-1-2',
        status: 'approved',
      })

      expect(result.success).toBe(true)
    })

    it('should accept featured updates', () => {
      const result = reviewUpdateSchema.safeParse({
        id: 'review-1-2',
        featured: true,
      })

      expect(result.success).toBe(true)
    })
  })

  describe('reviewQuerySchema', () => {
    it('should allow all status', () => {
      const result = reviewQuerySchema.safeParse({ status: 'all' })

      expect(result.success).toBe(true)
    })
  })

  describe('chatMessageSchema', () => {
    it('should reject empty messages', () => {
      const result = chatMessageSchema.safeParse({ message: '', sessionId: 's1' })

      expect(result.success).toBe(false)
    })

    it('should reject overly long messages', () => {
      const result = chatMessageSchema.safeParse({
        message: 'a'.repeat(1001),
        sessionId: 's1',
      })

      expect(result.success).toBe(false)
    })

    it('should accept valid messages', () => {
      const result = chatMessageSchema.safeParse({
        message: 'Hello',
        sessionId: 'session-1',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('bookingQuerySchema', () => {
    it('should reject invalid date formats', () => {
      const result = bookingQuerySchema.safeParse({ start: '01-2024-01' })

      expect(result.success).toBe(false)
    })

    it('should accept valid date formats', () => {
      const result = bookingQuerySchema.safeParse({
        start: '2024-01-01',
        end: '2024-01-02',
        timezone: 'UTC',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('emailSchema', () => {
    it('should validate emails', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true)
      expect(emailSchema.safeParse('not-an-email').success).toBe(false)
    })
  })

  describe('ratingSchema', () => {
    it('should validate rating bounds', () => {
      expect(ratingSchema.safeParse(5).success).toBe(true)
      expect(ratingSchema.safeParse(0).success).toBe(false)
      expect(ratingSchema.safeParse(6).success).toBe(false)
    })
  })

  describe('reviewSubmissionSchema', () => {
    it('should accept minimal valid review submission', () => {
      const result = reviewSubmissionSchema.safeParse({
        rating: 5,
        reviewText: 'This was a great service.',
        serviceType: 'AI Audit',
      })

      expect(result.success).toBe(true)
    })

    it('should reject invalid review submissions', () => {
      const result = reviewSubmissionSchema.safeParse({
        rating: 6,
        reviewText: 'Too short',
        serviceType: '',
      })

      expect(result.success).toBe(false)
    })
  })
})
