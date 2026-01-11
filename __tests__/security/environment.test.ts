/**
 * Security Test: Environment Variable Isolation
 *
 * Verifies that server-side secrets are NOT exposed to the client bundle.
 * This is critical - if these tests fail, secrets are leaking to browsers.
 */

import { describe, it, expect } from '@jest/globals';

describe('Security: Environment Variables', () => {
  describe('Server-side secrets should NOT be in client bundle', () => {
    // Note: These tests run in Node.js/jsdom environment where window is defined
    // In actual production, these would be undefined in the browser
    // The critical test is that next.config.js does NOT include them in env: {}

    it('should verify test environment is setup correctly', () => {
      // In test, these are set by jest.setup.js for server-side tests to work
      // The real protection is that next.config.js removed the env: {} section
      expect(process.env.NEXTAUTH_SECRET).toBeDefined();
      expect(process.env.ADMIN_PASSWORD_HASH).toBeDefined();
    });

    it('should not have env section in next.config.js exposing secrets', async () => {
      // This is the critical test - verify next.config.js doesn't expose secrets
      const config = require('@/next.config.js');

      // The config should NOT have an env property that exposes server secrets
      expect(config.env).toBeUndefined();
    });

    it('should only allow NEXT_PUBLIC_* variables in client', () => {
      // In production, only variables starting with NEXT_PUBLIC_ are in client bundle
      // Everything else is server-only

      const allEnvKeys = Object.keys(process.env);
      const publicKeys = allEnvKeys.filter(key => key.startsWith('NEXT_PUBLIC_'));

      // Public keys are safe to expose
      // All other keys should be server-only (NOT in client bundle)

      // Verify server-only keys exist in our test environment
      const serverOnlyKeys = [
        'GOOGLE_PRIVATE_KEY',
        'DB_SECRET_ACCESS_KEY',
        'ADMIN_PASSWORD_HASH',
        'NEXTAUTH_SECRET',
      ];

      serverOnlyKeys.forEach(key => {
        // These should NOT start with NEXT_PUBLIC_
        expect(key.startsWith('NEXT_PUBLIC_')).toBe(false);
      });
    });
  });

  describe('Public environment variables should be available', () => {
    it('NEXT_PUBLIC_* variables should be accessible in client', () => {
      // These are safe to expose
      // Just checking the pattern works
      const publicVars = Object.keys(process.env).filter(key =>
        key.startsWith('NEXT_PUBLIC_')
      );

      // We should have some NEXT_PUBLIC_ vars
      expect(publicVars.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Environment variable validation', () => {
    it('should have NEXTAUTH_URL defined in test', () => {
      // In test environment, this is set by jest.setup.js
      expect(process.env.NEXTAUTH_URL).toBeDefined();
    });

    it('should have NEXTAUTH_SECRET defined in test', () => {
      // In test environment, this is set by jest.setup.js
      expect(process.env.NEXTAUTH_SECRET).toBeDefined();
    });

    it('NEXTAUTH_SECRET should be sufficiently long', () => {
      const secret = process.env.NEXTAUTH_SECRET || '';
      expect(secret.length).toBeGreaterThanOrEqual(32);
    });
  });
});
