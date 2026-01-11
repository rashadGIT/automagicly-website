/**
 * Security Test: Security Headers
 *
 * Verifies that all required security headers are present
 * in the Next.js configuration.
 */

import { describe, it, expect } from '@jest/globals';

describe('Security: HTTP Headers', () => {
  // Note: These tests verify the configuration exists
  // Actual header testing requires integration tests with a running server

  describe('Security Header Configuration', () => {
    it('should have Content-Security-Policy configured', async () => {
      const config = require('@/next.config.js');
      const headers = await config.headers();

      const hasCSP = headers.some((headerConfig: any) =>
        headerConfig.headers.some((h: any) => h.key === 'Content-Security-Policy')
      );

      expect(hasCSP).toBe(true);
    });

    it('should have X-Frame-Options configured', async () => {
      const config = require('@/next.config.js');
      const headers = await config.headers();

      const hasXFrameOptions = headers.some((headerConfig: any) =>
        headerConfig.headers.some((h: any) => h.key === 'X-Frame-Options')
      );

      expect(hasXFrameOptions).toBe(true);
    });

    it('should have X-Content-Type-Options configured', async () => {
      const config = require('@/next.config.js');
      const headers = await config.headers();

      const hasXContentTypeOptions = headers.some((headerConfig: any) =>
        headerConfig.headers.some((h: any) => h.key === 'X-Content-Type-Options')
      );

      expect(hasXContentTypeOptions).toBe(true);
    });

    it('should have Referrer-Policy configured', async () => {
      const config = require('@/next.config.js');
      const headers = await config.headers();

      const hasReferrerPolicy = headers.some((headerConfig: any) =>
        headerConfig.headers.some((h: any) => h.key === 'Referrer-Policy')
      );

      expect(hasReferrerPolicy).toBe(true);
    });

    it('should have Permissions-Policy configured', async () => {
      const config = require('@/next.config.js');
      const headers = await config.headers();

      const hasPermissionsPolicy = headers.some((headerConfig: any) =>
        headerConfig.headers.some((h: any) => h.key === 'Permissions-Policy')
      );

      expect(hasPermissionsPolicy).toBe(true);
    });
  });

  describe('CSP Configuration Validation', () => {
    it('should have frame-ancestors none in CSP', async () => {
      const config = require('@/next.config.js');
      const headers = await config.headers();

      const cspHeader = headers
        .flatMap((h: any) => h.headers)
        .find((h: any) => h.key === 'Content-Security-Policy');

      if (cspHeader) {
        expect(cspHeader.value).toContain("frame-ancestors 'none'");
      }
    });

    it('should restrict default-src in CSP', async () => {
      const config = require('@/next.config.js');
      const headers = await config.headers();

      const cspHeader = headers
        .flatMap((h: any) => h.headers)
        .find((h: any) => h.key === 'Content-Security-Policy');

      if (cspHeader) {
        expect(cspHeader.value).toContain("default-src 'self'");
      }
    });
  });

  describe('X-Frame-Options Value', () => {
    it('should be set to DENY', async () => {
      const config = require('@/next.config.js');
      const headers = await config.headers();

      const xFrameHeader = headers
        .flatMap((h: any) => h.headers)
        .find((h: any) => h.key === 'X-Frame-Options');

      if (xFrameHeader) {
        expect(xFrameHeader.value).toBe('DENY');
      }
    });
  });

  describe('X-Content-Type-Options Value', () => {
    it('should be set to nosniff', async () => {
      const config = require('@/next.config.js');
      const headers = await config.headers();

      const xContentTypeHeader = headers
        .flatMap((h: any) => h.headers)
        .find((h: any) => h.key === 'X-Content-Type-Options');

      if (xContentTypeHeader) {
        expect(xContentTypeHeader.value).toBe('nosniff');
      }
    });
  });
});
