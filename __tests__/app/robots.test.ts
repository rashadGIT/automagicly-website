/**
 * Robots.txt Tests
 * Tests for the robots.ts SEO file
 */

import robots from '@/app/robots';

describe('Robots', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Structure', () => {
    it('should return a robots configuration object', () => {
      const result = robots();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should have rules property', () => {
      const result = robots();
      expect(result).toHaveProperty('rules');
    });

    it('should have sitemap property', () => {
      const result = robots();
      expect(result).toHaveProperty('sitemap');
    });
  });

  describe('Rules', () => {
    it('should have at least one rule', () => {
      const result = robots();
      expect(Array.isArray(result.rules)).toBe(true);
      expect(result.rules.length).toBeGreaterThan(0);
    });

    it('should have userAgent defined', () => {
      const result = robots();
      const rule = result.rules[0];
      expect(rule).toHaveProperty('userAgent');
      expect(rule.userAgent).toBe('*');
    });

    it('should allow root path', () => {
      const result = robots();
      const rule = result.rules[0];
      expect(rule).toHaveProperty('allow');
      expect(rule.allow).toBe('/');
    });

    it('should disallow sensitive paths', () => {
      const result = robots();
      const rule = result.rules[0];
      expect(rule).toHaveProperty('disallow');
      expect(Array.isArray(rule.disallow)).toBe(true);
      expect(rule.disallow).toContain('/api/');
      expect(rule.disallow).toContain('/admin/');
    });
  });

  describe('Sitemap URL', () => {
    it('should include sitemap.xml in the sitemap URL', () => {
      const result = robots();
      expect(result.sitemap).toContain('sitemap.xml');
    });

    it('should use default URL when NEXT_PUBLIC_SITE_URL is not set', () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      jest.isolateModules(() => {
        const robotsFresh = require('@/app/robots').default;
        const result = robotsFresh();
        expect(result.sitemap).toContain('automagicly.com');
      });
    });

    it('should use environment URL when NEXT_PUBLIC_SITE_URL is set', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-domain.com';
      jest.isolateModules(() => {
        const robotsFresh = require('@/app/robots').default;
        const result = robotsFresh();
        expect(result.sitemap).toBe('https://custom-domain.com/sitemap.xml');
      });
    });

    it('should have valid URL format', () => {
      const result = robots();
      expect(result.sitemap).toMatch(/^https?:\/\/.+\/sitemap\.xml$/);
    });
  });

  describe('Security', () => {
    it('should block API routes from crawling', () => {
      const result = robots();
      const rule = result.rules[0];
      expect(rule.disallow).toContain('/api/');
    });

    it('should block admin routes from crawling', () => {
      const result = robots();
      const rule = result.rules[0];
      expect(rule.disallow).toContain('/admin/');
    });
  });
});
