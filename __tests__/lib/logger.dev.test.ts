/**
 * @jest-environment node
 */

describe('logger (development)', () => {
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    process.env.NODE_ENV = 'development'
    jest.resetModules()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(console.error as jest.Mock).mockClear()
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    jest.restoreAllMocks()
  })

  it('should include error stack when present', () => {
    const { logger } = require('@/lib/logger')
    const error = new Error('Dev error')
    error.stack = 'stack-trace'

    logger.error('Message', {}, error)

    const errorCall = (console.error as jest.Mock).mock.calls[0][0]
    expect(errorCall).toContain('Stack')
  })

  it('should omit stack when not present', () => {
    const { logger } = require('@/lib/logger')
    const error = new Error('No stack')
    error.stack = ''

    logger.error('Message', {}, error)

    const errorCall = (console.error as jest.Mock).mock.calls[0][0]
    expect(errorCall).not.toContain('Stack')
  })
})
