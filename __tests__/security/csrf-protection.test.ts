/**
 * Security Test: CSRF Protection
 *
 * Verifies that Cross-Site Request Forgery protection is working
 * by validating origin and referer headers.
 */

/**
 * Security Test: CSRF Protection
 *
 * Verifies that Cross-Site Request Forgery protection is working
 * by validating origin and referer headers.
 */

import { describe, it, expect } from '@jest/globals';
import { verifyCsrfToken } from '@/lib/utils';

// Mock NextRequest since it requires Node.js runtime
const createMockRequest = (headers: Record<string, string>): any => {
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] || null,
    },
    method: 'POST',
    url: 'http://localhost:3000/api/reviews',
  };
};

describe('Security: CSRF Protection', () => {

  describe('Origin Header Validation', () => {
    it('should accept requests from same origin', () => {
      const request = createMockRequest({
        'origin': 'http://localhost:3000',
        'host': 'localhost:3000',
      });
      const result = verifyCsrfToken(request);
      expect(result).toBe(true);
    });

    it('should accept requests from HTTPS same origin', () => {
      const request = createMockRequest({
        'origin': 'https://localhost:3000',
        'host': 'localhost:3000',
      });
      const result = verifyCsrfToken(request);
      expect(result).toBe(true);
    });

    it('should reject requests from different origin', () => {
      const request = createMockRequest({
        'origin': 'http://evil.com',
        'host': 'localhost:3000',
      });
      const result = verifyCsrfToken(request);
      expect(result).toBe(false);
    });

    it('should reject subdomain attacks', () => {
      const request = createMockRequest({
        'origin': 'http://localhost:3000.evil.com',
        'host': 'localhost:3000',
      });
      const result = verifyCsrfToken(request);
      expect(result).toBe(false);
    });
  });

  describe('Referer Header Validation', () => {
    it('should accept requests with valid referer', () => {
      const request = createMockRequest({
        'referer': 'http://localhost:3000/admin/reviews',
        'host': 'localhost:3000',
      });
      const result = verifyCsrfToken(request);
      expect(result).toBe(true);
    });

    it('should reject requests with invalid referer', () => {
      const request = createMockRequest({
        'referer': 'http://evil.com/fake-page',
        'host': 'localhost:3000',
      });
      const result = verifyCsrfToken(request);
      expect(result).toBe(false);
    });

    it('should reject requests with no referer and no origin', () => {
      const request = createMockRequest({
        'host': 'localhost:3000',
      });
      const result = verifyCsrfToken(request);
      expect(result).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle origin header precedence over referer', () => {
      const request = createMockRequest({
        'origin': 'http://localhost:3000',
        'referer': 'http://evil.com',
        'host': 'localhost:3000',
      });
      // Origin takes precedence and is valid
      const result = verifyCsrfToken(request);
      expect(result).toBe(true);
    });

    it('should handle missing host header gracefully', () => {
      const request = createMockRequest({
        'origin': 'http://localhost:3000',
      });
      // Should still work with origin
      const result = verifyCsrfToken(request);
      expect(result).toBe(true);
    });
  });
});
