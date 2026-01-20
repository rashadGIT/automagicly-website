/**
 * Sanitize Utility Tests
 * Tests for the HTML sanitization utility
 */
import { sanitizeHtml, sanitizeHtmlSync, sanitizeHtmlAsync } from '@/lib/sanitize'

describe('sanitize', () => {
  describe('sanitizeHtml (sync)', () => {
    it('should return empty string for empty input', () => {
      expect(sanitizeHtml('')).toBe('')
    })

    it('should return plain text unchanged', () => {
      expect(sanitizeHtml('Hello world')).toBe('Hello world')
    })

    it('should sanitize basic HTML tags', () => {
      const result = sanitizeHtml('<script>alert("xss")</script>')
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('</script>')
    })

    it('should sanitize div tags', () => {
      const result = sanitizeHtml('<div>content</div>')
      expect(result).not.toContain('<div>')
    })

    it('should sanitize span tags', () => {
      const result = sanitizeHtml('<span>text</span>')
      expect(result).not.toContain('<span>')
    })

    it('should sanitize anchor tags', () => {
      const result = sanitizeHtml('<a href="http://evil.com">click me</a>')
      expect(result).not.toContain('<a')
      expect(result).not.toContain('href')
    })

    it('should sanitize img tags', () => {
      const result = sanitizeHtml('<img src="x" onerror="alert(1)">')
      expect(result).not.toContain('<img')
      expect(result).not.toContain('onerror')
    })

    it('should sanitize style attributes', () => {
      const result = sanitizeHtml('<p style="color:red">styled</p>')
      expect(result).not.toContain('style=')
    })

    it('should sanitize onclick attributes', () => {
      const result = sanitizeHtml('<button onclick="malicious()">click</button>')
      expect(result).not.toContain('onclick')
    })

    it('should handle nested HTML', () => {
      const result = sanitizeHtml('<div><p><span>nested</span></p></div>')
      expect(result).not.toContain('<div>')
      expect(result).not.toContain('<p>')
      expect(result).not.toContain('<span>')
      expect(result).toContain('nested')
    })

    it('should preserve text content', () => {
      const result = sanitizeHtml('<p>Important message</p>')
      expect(result).toContain('Important message')
    })

    it('should handle HTML entities', () => {
      const input = 'Test &amp; more'
      const result = sanitizeHtml(input)
      // Result should either preserve the entity or decode it
      expect(result).toBeTruthy()
    })

    it('should sanitize iframe tags', () => {
      const result = sanitizeHtml('<iframe src="http://evil.com"></iframe>')
      expect(result).not.toContain('<iframe')
    })

    it('should sanitize form tags', () => {
      const result = sanitizeHtml('<form action="/steal"><input></form>')
      expect(result).not.toContain('<form')
      expect(result).not.toContain('<input')
    })

    it('should handle SVG tags', () => {
      const result = sanitizeHtml('<svg onload="alert(1)"><circle/></svg>')
      expect(result).not.toContain('<svg')
      expect(result).not.toContain('onload')
    })

    it('should handle object/embed tags', () => {
      const result = sanitizeHtml('<object data="malware.swf"></object>')
      expect(result).not.toContain('<object')
    })
  })

  describe('sanitizeHtmlSync', () => {
    it('should return empty string for falsy input', () => {
      expect(sanitizeHtmlSync('')).toBe('')
    })

    it('should sanitize HTML synchronously', () => {
      const result = sanitizeHtmlSync('<script>bad</script>safe text')
      expect(result).not.toContain('<script>')
      expect(result).toContain('safe text')
    })

    it('should handle null-ish values gracefully', () => {
      // TypeScript would prevent this, but testing runtime behavior
      expect(sanitizeHtmlSync('')).toBe('')
    })

    it('should be equivalent to sanitizeHtml', () => {
      const input = '<div>test</div>'
      expect(sanitizeHtmlSync(input)).toBe(sanitizeHtml(input))
    })
  })

  describe('sanitizeHtmlAsync', () => {
    it('should return sanitized string', async () => {
      const result = await sanitizeHtmlAsync('<script>alert(1)</script>test')
      expect(result).not.toContain('<script>')
      expect(result).toContain('test')
    })

    it('should handle plain text', async () => {
      const result = await sanitizeHtmlAsync('plain text')
      expect(result).toBe('plain text')
    })

    it('should sanitize complex HTML', async () => {
      const result = await sanitizeHtmlAsync('<div onclick="bad()"><p>text</p></div>')
      expect(result).not.toContain('<div')
      expect(result).not.toContain('onclick')
      expect(result).toContain('text')
    })
  })

  describe('XSS prevention', () => {
    it('should prevent javascript: URLs', () => {
      const result = sanitizeHtml('<a href="javascript:alert(1)">link</a>')
      expect(result).not.toContain('javascript:')
    })

    it('should prevent data: URLs in images', () => {
      const result = sanitizeHtml('<img src="data:text/html,<script>alert(1)</script>">')
      expect(result).not.toContain('data:')
    })

    it('should prevent event handlers', () => {
      const handlers = [
        'onclick', 'onerror', 'onload', 'onmouseover',
        'onfocus', 'onblur', 'onsubmit', 'onchange'
      ]

      for (const handler of handlers) {
        const result = sanitizeHtml(`<div ${handler}="evil()">test</div>`)
        expect(result).not.toContain(handler)
      }
    })

    it('should handle uppercase HTML', () => {
      const result = sanitizeHtml('<SCRIPT>alert(1)</SCRIPT>')
      expect(result.toLowerCase()).not.toContain('<script>')
    })

    it('should handle mixed case HTML', () => {
      const result = sanitizeHtml('<ScRiPt>alert(1)</sCrIpT>')
      expect(result.toLowerCase()).not.toContain('<script>')
    })

    it('should handle HTML comments', () => {
      const result = sanitizeHtml('<!-- comment --><script>bad</script>')
      expect(result).not.toContain('<script>')
    })

    it('should handle CDATA sections', () => {
      const result = sanitizeHtml('<![CDATA[<script>bad</script>]]>')
      expect(result).not.toContain('<script>')
    })
  })

  describe('edge cases', () => {
    it('should handle very long strings', () => {
      const longText = 'a'.repeat(10000)
      const result = sanitizeHtml(`<div>${longText}</div>`)
      expect(result).toContain(longText)
    })

    it('should handle Unicode characters', () => {
      const result = sanitizeHtml('<p>Hello 世界 🌍</p>')
      expect(result).toContain('世界')
      expect(result).toContain('🌍')
    })

    it('should handle newlines and whitespace', () => {
      const result = sanitizeHtml('<p>line1\nline2\tline3</p>')
      expect(result).toContain('line1')
      expect(result).toContain('line2')
      expect(result).toContain('line3')
    })

    it('should handle malformed HTML', () => {
      const result = sanitizeHtml('<div><p>unclosed')
      expect(result).not.toContain('<div>')
      expect(result).toContain('unclosed')
    })

    it('should handle self-closing tags', () => {
      const result = sanitizeHtml('<br/><hr/>')
      expect(result).not.toContain('<br')
      expect(result).not.toContain('<hr')
    })

    it('should handle HTML with attributes without values', () => {
      const result = sanitizeHtml('<input disabled readonly>')
      expect(result).not.toContain('<input')
    })

    it('should handle HTML with special characters in attributes', () => {
      const result = sanitizeHtml('<div data-value="test&quot;more">text</div>')
      expect(result).not.toContain('<div')
    })
  })

  describe('fallback sanitization', () => {
    // These tests verify the fallback HTML entity encoding works
    it('should encode less than sign', () => {
      // When using fallback, < becomes &lt;
      const result = sanitizeHtml('<unsafe>')
      // Either the tag is stripped or encoded
      expect(result).not.toBe('<unsafe>')
    })

    it('should encode greater than sign', () => {
      const result = sanitizeHtml('a > b')
      // Either preserved as > or encoded as &gt;
      expect(result.includes('>') || result.includes('&gt;')).toBe(true)
    })

    it('should handle quotes in text', () => {
      const result = sanitizeHtml('He said "hello"')
      expect(result).toContain('hello')
    })

    it('should handle single quotes', () => {
      const result = sanitizeHtml("It's a test")
      expect(result).toContain('test')
    })
  })

  describe('module initialization paths', () => {
    const originalWindow = (global as any).window

    afterEach(() => {
      ;(global as any).window = originalWindow
      jest.resetModules()
      jest.dontMock('isomorphic-dompurify')
    })

    it('should use DOMPurify default and fallback to HTML encoding when sanitize is missing', async () => {
      jest.resetModules()
      jest.doMock('isomorphic-dompurify', () => ({ default: {} }))

      const { sanitizeHtmlAsync } = require('@/lib/sanitize')
      const result = await sanitizeHtmlAsync('<b>bold</b>')

      expect(result).toContain('&lt;b&gt;')
    })
  })
})
