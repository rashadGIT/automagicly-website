/**
 * Mock helpers for testing
 */

// Mock fetch responses
export const createMockFetch = (response: any, ok = true, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      headers: new Headers(),
      redirected: false,
      statusText: ok ? 'OK' : 'Error',
      type: 'basic' as ResponseType,
      url: '',
      clone: function() { return this },
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
    } as Response)
  )
}

// Reset fetch mock
export const resetMockFetch = () => {
  if (global.fetch && typeof (global.fetch as any).mockClear === 'function') {
    (global.fetch as any).mockClear()
  }
}

// Mock webhook success response
export const mockWebhookSuccess = () => {
  createMockFetch({ success: true }, true, 200)
}

// Mock webhook error response
export const mockWebhookError = () => {
  createMockFetch({ error: 'Failed to send data' }, false, 500)
}

// Mock calendar API response
export const mockCalendarResponse = (busyDates: string[] = []) => {
  createMockFetch({ busyDates }, true, 200)
}

// Mock reviews API response
export const mockReviewsResponse = (reviews: any[] = []) => {
  createMockFetch({ success: true, reviews, count: reviews.length }, true, 200)
}

// Helper to wait for async updates
export const waitFor = (callback: () => void, timeout = 1000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      try {
        callback()
        clearInterval(interval)
        resolve()
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          clearInterval(interval)
          reject(error)
        }
      }
    }, 50)
  })
}
