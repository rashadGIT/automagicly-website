/**
 * @jest-environment node
 */

// Set environment variables BEFORE importing the module
process.env.DB_ACCESS_KEY_ID = 'test-access-key'
process.env.DB_SECRET_ACCESS_KEY = 'test-secret-key'
process.env.REGION = 'us-east-1'

import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} from '@/lib/db'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

// Mock AWS SDK
jest.mock('@aws-sdk/client-dynamodb')
jest.mock('@aws-sdk/util-dynamodb')

const mockSend = jest.fn()
const mockMarshall = marshall as jest.MockedFunction<typeof marshall>
const mockUnmarshall = unmarshall as jest.MockedFunction<typeof unmarshall>

describe('lib/db.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSend.mockReset()
    mockMarshall.mockReset()
    mockUnmarshall.mockReset()

    ;(DynamoDBClient as jest.Mock).mockImplementation(() => ({
      send: mockSend,
    }))

    mockMarshall.mockImplementation((obj: any) => obj as any)
    mockUnmarshall.mockImplementation((obj: any) => obj as any)
  })

  describe('getClient', () => {
    it('should throw error when DB_ACCESS_KEY_ID is missing', async () => {
      const originalKey = process.env.DB_ACCESS_KEY_ID
      delete process.env.DB_ACCESS_KEY_ID

      await expect(getReviews()).rejects.toThrow(
        'Missing required DynamoDB credentials'
      )

      process.env.DB_ACCESS_KEY_ID = originalKey
    })

    it('should throw error when DB_SECRET_ACCESS_KEY is missing', async () => {
      const originalSecret = process.env.DB_SECRET_ACCESS_KEY
      delete process.env.DB_SECRET_ACCESS_KEY

      await expect(getReviews()).rejects.toThrow(
        'Missing required DynamoDB credentials'
      )

      process.env.DB_SECRET_ACCESS_KEY = originalSecret
    })

    it('should default region to us-east-1 when REGION is missing', async () => {
      const originalRegion = process.env.REGION
      delete process.env.REGION

      mockSend.mockResolvedValueOnce({ Items: [] })

      await getReviews()

      expect(DynamoDBClient).toHaveBeenCalledWith(
        expect.objectContaining({
          region: 'us-east-1',
        })
      )

      process.env.REGION = originalRegion
    })
  })

  describe('getReviews', () => {
    it('should return all reviews sorted by created_at DESC', async () => {
      const mockReviews = [
        {
          id: '1',
          rating: 5,
          review_text: 'Great!',
          service_type: 'AI Audit',
          status: 'approved',
          created_at: 1000,
          updated_at: 1000,
        },
        {
          id: '2',
          rating: 4,
          review_text: 'Good',
          service_type: 'One-Off',
          status: 'pending',
          created_at: 2000,
          updated_at: 2000,
        },
      ]

      mockSend.mockResolvedValueOnce({ Items: mockReviews })

      const result = await getReviews()

      expect(result[0].id).toBe('2')
      expect(result[1].id).toBe('1')
    })

    it('should return empty array when scan has no items', async () => {
      mockSend.mockResolvedValueOnce({})

      const result = await getReviews()

      expect(result).toEqual([])
    })

    it('should filter reviews by status', async () => {
      const mockReviews = [
        {
          id: '1',
          rating: 5,
          review_text: 'Great!',
          service_type: 'AI Audit',
          status: 'approved',
          created_at: 1000,
          updated_at: 1000,
        },
      ]

      mockSend.mockResolvedValueOnce({ Items: mockReviews })

      const result = await getReviews('approved')

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('approved')
    })

    it('should filter out low-rated approved reviews', async () => {
      const mockReviews = [
        {
          id: '1',
          rating: 5,
          review_text: 'Great!',
          service_type: 'AI Audit',
          status: 'approved',
          created_at: 1000,
          updated_at: 1000,
        },
        {
          id: '2',
          rating: 2,
          review_text: 'Bad',
          service_type: 'One-Off',
          status: 'approved',
          created_at: 2000,
          updated_at: 2000,
        },
      ]

      mockSend.mockResolvedValueOnce({ Items: mockReviews })

      const result = await getReviews('approved')

      expect(result).toHaveLength(1)
      expect(result[0].rating).toBe(5)
    })

    it('should return all reviews for non-approved status', async () => {
      const mockReviews = [
        {
          id: '1',
          rating: 1,
          review_text: 'Bad',
          service_type: 'One-Off',
          status: 'pending',
          created_at: 1000,
          updated_at: 1000,
        },
        {
          id: '2',
          rating: 5,
          review_text: 'Great',
          service_type: 'AI Audit',
          status: 'pending',
          created_at: 2000,
          updated_at: 2000,
        },
      ]

      mockSend.mockResolvedValueOnce({ Items: mockReviews })

      const result = await getReviews('pending')

      expect(result).toHaveLength(2)
    })

    it('should return empty array when no items are returned', async () => {
      mockSend.mockResolvedValueOnce({})

      const result = await getReviews('approved')

      expect(result).toEqual([])
    })

    it('should rethrow errors from the database client', async () => {
      mockSend.mockRejectedValueOnce(new Error('DynamoDB failure'))

      await expect(getReviews()).rejects.toThrow('DynamoDB failure')
    })
  })

  describe('createReview', () => {
    it('should create review with generated id and timestamps', async () => {
      mockSend.mockResolvedValueOnce({})

      const result = await createReview({
        rating: 5,
        review_text: 'Excellent!',
        service_type: 'AI Partnership',
        status: 'pending',
      })

      expect(result.id).toBeDefined()
      expect(result.created_at).toBeDefined()
      expect(result.updated_at).toBeDefined()
    })

    it('should use browser crypto.randomUUID when available', async () => {
      const originalCrypto = (global as any).crypto
      ;(global as any).crypto = { randomUUID: jest.fn(() => 'browser-uuid') }

      jest.resetModules()
      ;(DynamoDBClient as jest.Mock).mockImplementation(() => ({
        send: mockSend,
      }))
      jest.doMock('crypto', () => ({ randomUUID: () => 'node-uuid' }))

      const { createReview: createReviewFresh } = require('@/lib/db')
      mockSend.mockResolvedValueOnce({})

      const result = await createReviewFresh({
        rating: 5,
        review_text: 'Excellent!',
        service_type: 'AI Partnership',
        status: 'pending',
      })

      expect(result.id).toBe('browser-uuid')

      ;(global as any).crypto = originalCrypto
      jest.dontMock('crypto')
    })

    it('should fall back to Node randomUUID when browser crypto is missing', async () => {
      const originalCrypto = (global as any).crypto
      ;(global as any).crypto = undefined

      jest.resetModules()
      ;(DynamoDBClient as jest.Mock).mockImplementation(() => ({
        send: mockSend,
      }))
      jest.doMock('crypto', () => ({ randomUUID: () => 'node-uuid' }))

      const { createReview: createReviewFresh } = require('@/lib/db')
      mockSend.mockResolvedValueOnce({})

      const result = await createReviewFresh({
        rating: 5,
        review_text: 'Excellent!',
        service_type: 'AI Partnership',
        status: 'pending',
      })

      expect(result.id).toBe('node-uuid')

      ;(global as any).crypto = originalCrypto
      jest.dontMock('crypto')
    })

    it('should rethrow errors from the database client', async () => {
      mockSend.mockRejectedValueOnce(new Error('Create failed'))

      await expect(
        createReview({
          rating: 5,
          review_text: 'Excellent!',
          service_type: 'AI Partnership',
          status: 'pending',
        })
      ).rejects.toThrow('Create failed')
    })
  })

  describe('updateReview', () => {
    it('should update review status', async () => {
      const updatedReview = {
        id: 'test-id',
        status: 'approved',
        updated_at: Date.now(),
      }

      mockSend.mockResolvedValueOnce({ Attributes: updatedReview })

      const result = await updateReview('test-id', { status: 'approved' })

      expect(result?.status).toBe('approved')
    })

    it('should set approved_at when approving', async () => {
      mockSend.mockResolvedValueOnce({
        Attributes: {
          id: 'test-id',
          status: 'approved',
          approved_at: Date.now(),
        },
      })

      await updateReview('test-id', { status: 'approved' })

      expect(mockMarshall).toHaveBeenCalledWith(
        expect.objectContaining({
          ':approved_at': expect.any(Number),
        })
      )
    })

    it('should update featured flag without status', async () => {
      mockSend.mockResolvedValueOnce({
        Attributes: {
          id: 'test-id',
          featured: true,
        },
      })

      const result = await updateReview('test-id', { featured: true })

      expect(result?.featured).toBe(true)
      const valuesCall = mockMarshall.mock.calls.find(
        (call) => call[0] && Object.prototype.hasOwnProperty.call(call[0], ':featured')
      )
      const valuesArg = valuesCall?.[0] as Record<string, unknown>
      expect(valuesArg).toHaveProperty(':featured', true)
    })

    it('should not set approved_at when status is not approved', async () => {
      mockSend.mockResolvedValueOnce({
        Attributes: {
          id: 'test-id',
          status: 'rejected',
        },
      })

      await updateReview('test-id', { status: 'rejected' })

      const valuesArg = mockMarshall.mock.calls[0][0] as Record<string, unknown>
      expect(valuesArg).not.toHaveProperty(':approved_at')
    })

    it('should return null when no attributes are returned', async () => {
      mockSend.mockResolvedValueOnce({})

      const result = await updateReview('test-id', { status: 'pending' })

      expect(result).toBeNull()
    })

    it('should rethrow errors from the database client', async () => {
      mockSend.mockRejectedValueOnce(new Error('Update failed'))

      await expect(updateReview('test-id', { status: 'pending' })).rejects.toThrow(
        'Update failed'
      )
    })
  })

  describe('deleteReview', () => {
    it('should delete review and return true', async () => {
      mockSend.mockResolvedValueOnce({})

      const result = await deleteReview('test-id')

      expect(result).toBe(true)
    })

    it('should rethrow errors from the database client', async () => {
      mockSend.mockRejectedValueOnce(new Error('Delete failed'))

      await expect(deleteReview('test-id')).rejects.toThrow('Delete failed')
    })
  })
})
