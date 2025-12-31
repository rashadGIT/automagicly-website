/**
 * API Route Tests - Testing Next.js API endpoints
 */
import { GET } from '@/app/api/reviews-simple/route'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

// Mock AWS SDK
jest.mock('@aws-sdk/client-dynamodb')
jest.mock('@aws-sdk/util-dynamodb')

describe('GET /api/reviews-simple', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return reviews from DynamoDB', async () => {
    // Mock DynamoDB response
    const mockItems = [
      {
        id: { S: 'review-1' },
        name: { S: 'John Doe' },
        rating: { N: '5' },
        status: { S: 'approved' },
        created_at: { N: '1234567890' },
      },
    ]

    const mockSend = jest.fn().mockResolvedValue({
      Items: mockItems,
    })

    ;(DynamoDBClient as jest.Mock).mockImplementation(() => ({
      send: mockSend,
    }))

    ;(unmarshall as jest.Mock).mockReturnValue({
      id: 'review-1',
      name: 'John Doe',
      rating: 5,
      status: 'approved',
      created_at: 1234567890,
    })

    const response = await GET()
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.reviews).toHaveLength(1)
    expect(data.reviews[0].name).toBe('John Doe')
    expect(data.count).toBe(1)
  })

  it('should handle DynamoDB errors gracefully', async () => {
    const mockSend = jest.fn().mockRejectedValue(new Error('DynamoDB error'))

    ;(DynamoDBClient as jest.Mock).mockImplementation(() => ({
      send: mockSend,
    }))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('DynamoDB error')
  })

  it('should sort reviews by created_at descending', async () => {
    const mockItems = [
      {
        id: { S: 'review-1' },
        created_at: { N: '1000' },
      },
      {
        id: { S: 'review-2' },
        created_at: { N: '2000' },
      },
      {
        id: { S: 'review-3' },
        created_at: { N: '1500' },
      },
    ]

    const mockSend = jest.fn().mockResolvedValue({ Items: mockItems })
    ;(DynamoDBClient as jest.Mock).mockImplementation(() => ({
      send: mockSend,
    }))

    let callCount = 0
    ;(unmarshall as jest.Mock).mockImplementation(() => {
      const items = [
        { id: 'review-1', created_at: 1000 },
        { id: 'review-2', created_at: 2000 },
        { id: 'review-3', created_at: 1500 },
      ]
      return items[callCount++]
    })

    const response = await GET()
    const data = await response.json()

    // Should be sorted: review-2 (2000), review-3 (1500), review-1 (1000)
    expect(data.reviews[0].id).toBe('review-2')
    expect(data.reviews[1].id).toBe('review-3')
    expect(data.reviews[2].id).toBe('review-1')
  })

  it('should set cache-control headers', async () => {
    const mockSend = jest.fn().mockResolvedValue({ Items: [] })
    ;(DynamoDBClient as jest.Mock).mockImplementation(() => ({
      send: mockSend,
    }))

    const response = await GET()
    const headers = response.headers

    expect(headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate')
    expect(headers.get('Pragma')).toBe('no-cache')
    expect(headers.get('Expires')).toBe('0')
  })
})
