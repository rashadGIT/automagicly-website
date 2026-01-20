/**
 * @jest-environment node
 */

jest.mock('aws-rum-web', () => ({
  AwsRum: jest.fn(),
}))

describe('RUM Configuration (node)', () => {
  it('should return null when window is undefined', () => {
    process.env.NODE_ENV = 'production'

    const { initRUM } = require('@/lib/rum-config')

    expect(initRUM()).toBeNull()
  })
})
