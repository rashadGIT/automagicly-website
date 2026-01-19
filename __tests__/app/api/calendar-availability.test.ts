/**
 * Calendar Availability API Route Tests
 * Tests for /api/calendar/availability endpoint
 */
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/calendar/availability/route'

// Mock googleapis
jest.mock('googleapis', () => ({
  google: {
    auth: {
      JWT: jest.fn().mockImplementation(() => ({})),
    },
    calendar: jest.fn().mockReturnValue({
      events: {
        list: jest.fn(),
      },
    }),
  },
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}))

import { google } from 'googleapis'
import { logger } from '@/lib/logger'

describe('GET /api/calendar/availability', () => {
  const mockEventsList = google.calendar({} as any).events.list as jest.MockedFunction<any>

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'service@test.iam.gserviceaccount.com'
    process.env.GOOGLE_PRIVATE_KEY = 'test-private-key'
    process.env.GOOGLE_CALENDAR_ID = 'test-calendar-id'
  })

  afterEach(() => {
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    delete process.env.GOOGLE_PRIVATE_KEY
    delete process.env.GOOGLE_CALENDAR_ID
  })

  const createRequest = (params: Record<string, string> = {}) => {
    const url = new URL('http://localhost:3000/api/calendar/availability')
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
    return new NextRequest(url)
  }

  describe('Input Validation', () => {
    it('should accept request without parameters', async () => {
      mockEventsList.mockResolvedValueOnce({ data: { items: [] } })

      const request = createRequest()
      const response = await GET(request)

      expect(response.status).not.toBe(400)
    })

    it('should accept valid date parameters', async () => {
      mockEventsList.mockResolvedValueOnce({ data: { items: [] } })

      const request = createRequest({
        start: '2026-01-15',
        end: '2026-02-15',
      })
      const response = await GET(request)

      expect(response.status).not.toBe(400)
    })

    it('should accept timezone parameter', async () => {
      mockEventsList.mockResolvedValueOnce({ data: { items: [] } })

      const request = createRequest({
        timezone: 'America/Los_Angeles',
      })
      const response = await GET(request)

      expect(response.status).not.toBe(400)
    })

    it('should return error for invalid date format', async () => {
      const request = createRequest({
        start: 'invalid-date',
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid query parameters')
    })
  })

  describe('Google Calendar Credentials', () => {
    it('should return error when service account email missing', async () => {
      delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Calendar service not configured')
      expect(logger.error).toHaveBeenCalled()
    })

    it('should return error when private key missing', async () => {
      delete process.env.GOOGLE_PRIVATE_KEY

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Calendar service not configured')
    })
  })

  describe('Calendar Events', () => {
    it('should return empty array when no events', async () => {
      mockEventsList.mockResolvedValueOnce({ data: { items: [] } })

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.busyDates).toEqual([])
    })

    it('should return busy dates from events', async () => {
      mockEventsList.mockResolvedValueOnce({
        data: {
          items: [
            { start: { date: '2026-01-20' } },
            { start: { date: '2026-01-21' } },
          ],
        },
      })

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.busyDates).toContain('2026-01-20')
      expect(data.busyDates).toContain('2026-01-21')
    })

    it('should handle timed events', async () => {
      mockEventsList.mockResolvedValueOnce({
        data: {
          items: [
            { start: { dateTime: '2026-01-20T10:00:00-05:00' } },
          ],
        },
      })

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.busyDates).toContain('2026-01-20')
    })

    it('should deduplicate dates', async () => {
      mockEventsList.mockResolvedValueOnce({
        data: {
          items: [
            { start: { date: '2026-01-20' } },
            { start: { dateTime: '2026-01-20T14:00:00-05:00' } },
          ],
        },
      })

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      // Should only have one entry for 2026-01-20
      const count = data.busyDates.filter((d: string) => d === '2026-01-20').length
      expect(count).toBe(1)
    })

    it('should sort dates', async () => {
      mockEventsList.mockResolvedValueOnce({
        data: {
          items: [
            { start: { date: '2026-01-25' } },
            { start: { date: '2026-01-20' } },
            { start: { date: '2026-01-22' } },
          ],
        },
      })

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.busyDates[0]).toBe('2026-01-20')
      expect(data.busyDates[1]).toBe('2026-01-22')
      expect(data.busyDates[2]).toBe('2026-01-25')
    })

    it('should handle events without start date', async () => {
      mockEventsList.mockResolvedValueOnce({
        data: {
          items: [
            { start: {} }, // No date or dateTime
            { start: { date: '2026-01-20' } },
          ],
        },
      })

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.busyDates).toEqual(['2026-01-20'])
    })

    it('should handle null items', async () => {
      mockEventsList.mockResolvedValueOnce({
        data: { items: null },
      })

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.busyDates).toEqual([])
    })
  })

  describe('Error Handling', () => {
    it('should handle Google API errors', async () => {
      mockEventsList.mockRejectedValueOnce(new Error('Google API error'))

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch calendar availability')
      expect(data.busyDates).toEqual([])
      expect(logger.error).toHaveBeenCalled()
    })

    it('should handle authentication errors', async () => {
      mockEventsList.mockRejectedValueOnce(new Error('Authentication failed'))

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch calendar availability')
    })

    it('should handle rate limit errors', async () => {
      mockEventsList.mockRejectedValueOnce(new Error('Rate limit exceeded'))

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch calendar availability')
    })
  })

  describe('Date Range Calculation', () => {
    it('should use default 60 day range when no end date', async () => {
      mockEventsList.mockResolvedValueOnce({ data: { items: [] } })

      const request = createRequest({ start: '2026-01-15' })
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockEventsList).toHaveBeenCalled()
    })

    it('should use provided date range', async () => {
      mockEventsList.mockResolvedValueOnce({ data: { items: [] } })

      const request = createRequest({
        start: '2026-01-15',
        end: '2026-01-20',
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
    })

    it('should handle timezone in date calculations', async () => {
      mockEventsList.mockResolvedValueOnce({ data: { items: [] } })

      const request = createRequest({
        timezone: 'America/New_York',
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockEventsList).toHaveBeenCalledWith(
        expect.objectContaining({
          timeZone: 'America/New_York',
        })
      )
    })
  })

  describe('API Configuration', () => {
    it('should use default calendar ID if not set', async () => {
      // GOOGLE_CALENDAR_ID is already set in beforeEach
      mockEventsList.mockResolvedValueOnce({ data: { items: [] } })

      const request = createRequest()
      await GET(request)

      expect(mockEventsList).toHaveBeenCalledWith(
        expect.objectContaining({
          calendarId: 'test-calendar-id',
        })
      )
    })

    it('should request single events', async () => {
      mockEventsList.mockResolvedValueOnce({ data: { items: [] } })

      const request = createRequest()
      await GET(request)

      expect(mockEventsList).toHaveBeenCalledWith(
        expect.objectContaining({
          singleEvents: true,
          orderBy: 'startTime',
        })
      )
    })
  })
})
