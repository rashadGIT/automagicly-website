/**
 * @jest-environment node
 */

describe('utils (node)', () => {
  it('should return empty string when window is undefined', () => {
    const { getSessionId } = require('@/lib/utils')
    const sessionId = getSessionId()

    expect(sessionId).toBe('')
  })

  it('should map busyDates to Date objects', async () => {
    jest.resetModules()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ busyDates: ['2025-01-15'] }),
      status: 200,
      statusText: 'OK',
    })

    const { fetchBusyDates } = require('@/lib/utils')
    const result = await fetchBusyDates()

    expect(result).toHaveLength(1)
    expect(result[0]).toBeInstanceOf(Date)
  })

  it('should handle missing busyDates array', async () => {
    jest.resetModules()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
      status: 200,
      statusText: 'OK',
    })

    const { fetchBusyDates } = require('@/lib/utils')
    const result = await fetchBusyDates()

    expect(result).toEqual([])
  })
})
