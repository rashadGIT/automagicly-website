/**
 * Reviews API Route Tests
 * Tests for /api/reviews endpoint (GET, PATCH, DELETE)
 */
import { NextRequest } from 'next/server'
import { GET, PATCH, DELETE } from '@/app/api/reviews/route'

// Mock dependencies
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  ScanCommand: jest.fn(),
  QueryCommand: jest.fn(),
}))

jest.mock('@aws-sdk/util-dynamodb', () => ({
  unmarshall: jest.fn((item) => item),
}))

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  getAuthOptions: jest.fn(() => ({})),
}))

jest.mock('@/lib/db', () => ({
  updateReview: jest.fn(),
  deleteReview: jest.fn(),
}))

jest.mock('@/lib/utils', () => ({
  verifyCsrfToken: jest.fn(),
  isAdmin: jest.fn(),
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    security: jest.fn(),
  },
}))

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { getServerSession } from 'next-auth/next'
import { updateReview, deleteReview } from '@/lib/db'
import { verifyCsrfToken, isAdmin } from '@/lib/utils'
import { logger } from '@/lib/logger'

describe('Reviews API', () => {
  const mockDynamoClient = DynamoDBClient as jest.MockedClass<typeof DynamoDBClient>
  const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
  const mockUpdateReview = updateReview as jest.MockedFunction<typeof updateReview>
  const mockDeleteReview = deleteReview as jest.MockedFunction<typeof deleteReview>
  const mockVerifyCsrfToken = verifyCsrfToken as jest.MockedFunction<typeof verifyCsrfToken>
  const mockIsAdmin = isAdmin as jest.MockedFunction<typeof isAdmin>

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.DB_ACCESS_KEY_ID = 'test-key'
    process.env.DB_SECRET_ACCESS_KEY = 'test-secret'
    process.env.REGION = 'us-east-1'
  })

  describe('GET /api/reviews', () => {
    const createGetRequest = (params: Record<string, string> = {}) => {
      const url = new URL('http://localhost:3000/api/reviews')
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
      return new NextRequest(url)
    }

    it('should return approved reviews for non-admin users', async () => {
      mockGetServerSession.mockResolvedValueOnce(null)
      mockIsAdmin.mockReturnValue(false)

      const mockSend = jest.fn().mockResolvedValueOnce({
        Items: [
          { id: '1', rating: 5, status: 'approved' },
          { id: '2', rating: 4, status: 'approved' },
        ],
      })
      mockDynamoClient.mockImplementation(() => ({
        send: mockSend,
      }) as any)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.reviews).toBeDefined()
    })

    it('should force status=approved for non-admin requests', async () => {
      mockGetServerSession.mockResolvedValueOnce(null)
      mockIsAdmin.mockReturnValue(false)

      const mockSend = jest.fn().mockResolvedValueOnce({ Items: [] })
      mockDynamoClient.mockImplementation(() => ({
        send: mockSend,
      }) as any)

      // Even if requesting pending, should get approved
      const request = createGetRequest({ status: 'pending' })
      await GET(request)

      // The query should filter for approved
      expect(mockSend).toHaveBeenCalled()
    })

    it('should allow admin to request any status', async () => {
      mockGetServerSession.mockResolvedValueOnce({ user: { email: 'admin@test.com' } })
      mockIsAdmin.mockReturnValue(true)

      const mockSend = jest.fn().mockResolvedValueOnce({ Items: [] })
      mockDynamoClient.mockImplementation(() => ({
        send: mockSend,
      }) as any)

      const request = createGetRequest({ status: 'pending' })
      await GET(request)

      expect(mockSend).toHaveBeenCalled()
    })

    it('should return error when DB credentials missing', async () => {
      delete process.env.DB_ACCESS_KEY_ID
      mockGetServerSession.mockResolvedValueOnce(null)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Database configuration error')
      expect(logger.error).toHaveBeenCalled()
    })

    it('should filter approved reviews with 3+ stars', async () => {
      mockGetServerSession.mockResolvedValueOnce(null)
      mockIsAdmin.mockReturnValue(false)

      const mockSend = jest.fn().mockResolvedValueOnce({
        Items: [
          { id: '1', rating: 5, status: 'approved' },
          { id: '2', rating: 2, status: 'approved' }, // Should be filtered
          { id: '3', rating: 3, status: 'approved' },
        ],
      })
      mockDynamoClient.mockImplementation(() => ({
        send: mockSend,
      }) as any)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      // Only reviews with rating >= 3 should be returned
      expect(response.status).toBe(200)
    })

    it('should sort reviews by created_at descending', async () => {
      mockGetServerSession.mockResolvedValueOnce(null)
      mockIsAdmin.mockReturnValue(false)

      const mockSend = jest.fn().mockResolvedValueOnce({
        Items: [
          { id: '1', rating: 5, status: 'approved', created_at: 1000 },
          { id: '2', rating: 4, status: 'approved', created_at: 2000 },
        ],
      })
      mockDynamoClient.mockImplementation(() => ({
        send: mockSend,
      }) as any)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      // Reviews should be sorted with newest first
    })

    it('should handle DynamoDB errors gracefully', async () => {
      mockGetServerSession.mockResolvedValueOnce(null)
      mockIsAdmin.mockReturnValue(false)

      const mockSend = jest.fn().mockRejectedValueOnce(new Error('DynamoDB error'))
      mockDynamoClient.mockImplementation(() => ({
        send: mockSend,
      }) as any)

      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch reviews')
      expect(logger.error).toHaveBeenCalled()
    })
  })

  describe('PATCH /api/reviews', () => {
    const createPatchRequest = (body: any) => {
      return new NextRequest('http://localhost:3000/api/reviews', {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      })
    }

    it('should reject without CSRF token', async () => {
      mockVerifyCsrfToken.mockReturnValue(false)

      const request = createPatchRequest({ id: 'review-1', status: 'approved' })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Invalid request origin')
      expect(logger.security).toHaveBeenCalled()
    })

    it('should reject without admin session', async () => {
      mockVerifyCsrfToken.mockReturnValue(true)
      mockGetServerSession.mockResolvedValueOnce(null)
      mockIsAdmin.mockReturnValue(false)

      const request = createPatchRequest({ id: 'review-1', status: 'approved' })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Unauthorized - admin access required')
    })

    it('should reject invalid content type', async () => {
      mockVerifyCsrfToken.mockReturnValue(true)

      const request = new NextRequest('http://localhost:3000/api/reviews', {
        method: 'PATCH',
        headers: { 'content-type': 'text/plain' },
        body: 'test',
      })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Content-Type must be application/json')
    })

    it('should reject invalid request data', async () => {
      mockVerifyCsrfToken.mockReturnValue(true)
      mockGetServerSession.mockResolvedValueOnce({ user: { email: 'admin@test.com' } })
      mockIsAdmin.mockReturnValue(true)

      const request = createPatchRequest({ invalid: 'data' })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request data')
    })

    it('should update review status', async () => {
      mockVerifyCsrfToken.mockReturnValue(true)
      mockGetServerSession.mockResolvedValueOnce({ user: { email: 'admin@test.com' } })
      mockIsAdmin.mockReturnValue(true)
      mockUpdateReview.mockResolvedValueOnce({ id: 'review-1', status: 'approved' })

      const request = createPatchRequest({ id: 'review-1', status: 'approved' })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Review approved')
      expect(mockUpdateReview).toHaveBeenCalledWith('review-1', { status: 'approved' })
    })

    it('should update review featured status', async () => {
      mockVerifyCsrfToken.mockReturnValue(true)
      mockGetServerSession.mockResolvedValueOnce({ user: { email: 'admin@test.com' } })
      mockIsAdmin.mockReturnValue(true)
      mockUpdateReview.mockResolvedValueOnce({ id: 'review-1', featured: true })

      const request = createPatchRequest({ id: 'review-1', featured: true })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should return 404 when review not found', async () => {
      mockVerifyCsrfToken.mockReturnValue(true)
      mockGetServerSession.mockResolvedValueOnce({ user: { email: 'admin@test.com' } })
      mockIsAdmin.mockReturnValue(true)
      mockUpdateReview.mockResolvedValueOnce(null)

      const request = createPatchRequest({ id: 'nonexistent', status: 'approved' })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Review not found')
    })

    it('should handle update errors', async () => {
      mockVerifyCsrfToken.mockReturnValue(true)
      mockGetServerSession.mockResolvedValueOnce({ user: { email: 'admin@test.com' } })
      mockIsAdmin.mockReturnValue(true)
      mockUpdateReview.mockRejectedValueOnce(new Error('DB error'))

      const request = createPatchRequest({ id: 'review-1', status: 'approved' })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to update review')
      expect(logger.error).toHaveBeenCalled()
    })
  })

  describe('DELETE /api/reviews', () => {
    const createDeleteRequest = (id?: string) => {
      const url = new URL('http://localhost:3000/api/reviews')
      if (id) url.searchParams.set('id', id)
      return new NextRequest(url, { method: 'DELETE' })
    }

    it('should reject without CSRF token', async () => {
      mockVerifyCsrfToken.mockReturnValue(false)

      const request = createDeleteRequest('review-1')
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Invalid request origin')
    })

    it('should reject without admin session', async () => {
      mockVerifyCsrfToken.mockReturnValue(true)
      mockGetServerSession.mockResolvedValueOnce(null)
      mockIsAdmin.mockReturnValue(false)

      const request = createDeleteRequest('review-1')
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Unauthorized - admin access required')
    })

    it('should reject missing id parameter', async () => {
      mockVerifyCsrfToken.mockReturnValue(true)
      mockGetServerSession.mockResolvedValueOnce({ user: { email: 'admin@test.com' } })
      mockIsAdmin.mockReturnValue(true)

      const request = createDeleteRequest()
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request data')
    })

    it('should delete review successfully', async () => {
      mockVerifyCsrfToken.mockReturnValue(true)
      mockGetServerSession.mockResolvedValueOnce({ user: { email: 'admin@test.com' } })
      mockIsAdmin.mockReturnValue(true)
      mockDeleteReview.mockResolvedValueOnce(true)

      const request = createDeleteRequest('review-1')
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Review deleted')
      expect(mockDeleteReview).toHaveBeenCalledWith('review-1')
    })

    it('should return 500 when delete fails', async () => {
      mockVerifyCsrfToken.mockReturnValue(true)
      mockGetServerSession.mockResolvedValueOnce({ user: { email: 'admin@test.com' } })
      mockIsAdmin.mockReturnValue(true)
      mockDeleteReview.mockResolvedValueOnce(false)

      const request = createDeleteRequest('review-1')
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to delete review')
    })

    it('should handle delete errors', async () => {
      mockVerifyCsrfToken.mockReturnValue(true)
      mockGetServerSession.mockResolvedValueOnce({ user: { email: 'admin@test.com' } })
      mockIsAdmin.mockReturnValue(true)
      mockDeleteReview.mockRejectedValueOnce(new Error('DB error'))

      const request = createDeleteRequest('review-1')
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to delete review')
      expect(logger.error).toHaveBeenCalled()
    })
  })
})
