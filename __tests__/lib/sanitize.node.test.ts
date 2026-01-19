/**
 * @jest-environment node
 */

describe('sanitize (node)', () => {
  afterEach(() => {
    jest.resetModules()
    jest.dontMock('isomorphic-dompurify')
  })

  it('should use server-side DOMPurify when available', async () => {
    jest.doMock('isomorphic-dompurify', () => ({
      default: {
        sanitize: (input: string) => input.replace(/<[^>]*>/g, ''),
      },
    }))

    const { sanitizeHtmlAsync, sanitizeHtmlSync } = require('@/lib/sanitize')

    const asyncResult = await sanitizeHtmlAsync('<span>ok</span>')
    expect(asyncResult).toContain('&lt;span&gt;')

    const syncResult = sanitizeHtmlSync('<b>ok</b>')
    expect(syncResult).toContain('&lt;b&gt;')
  })

  it('should fall back when DOMPurify import fails', async () => {
    jest.doMock('isomorphic-dompurify', () => {
      throw new Error('load failed')
    })

    const { sanitizeHtmlAsync } = require('@/lib/sanitize')
    const result = await sanitizeHtmlAsync('<span>ok</span>')

    expect(result).toBe('ok')
  })

  it('should fall back to encoding when sanitize throws', () => {
    jest.doMock('isomorphic-dompurify', () => ({
      default: {
        sanitize: () => {
          throw new Error('sanitize failed')
        },
      },
    }))

    const { sanitizeHtmlSync } = require('@/lib/sanitize')
    const result = sanitizeHtmlSync('<b>bold</b>')

    expect(result).toContain('&lt;b&gt;')
  })
})
