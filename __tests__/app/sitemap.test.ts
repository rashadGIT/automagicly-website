/**
 * Sitemap Tests
 * Tests for the sitemap.ts SEO file
 */

import sitemap from '@/app/sitemap';

describe('Sitemap', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Structure', () => {
    it('should return an array of sitemap entries', () => {
      const result = sitemap();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include the homepage', () => {
      const result = sitemap();
      const homepage = result.find((entry) => entry.url.endsWith('.com') || entry.url.endsWith('/'));
      expect(homepage).toBeDefined();
    });

    it('should have required fields for each entry', () => {
      const result = sitemap();
      result.forEach((entry) => {
        expect(entry).toHaveProperty('url');
        expect(entry).toHaveProperty('lastModified');
        expect(entry).toHaveProperty('changeFrequency');
        expect(entry).toHaveProperty('priority');
      });
    });
  });

  describe('Homepage Entry', () => {
    it('should have priority 1 for homepage', () => {
      const result = sitemap();
      const homepage = result[0];
      expect(homepage.priority).toBe(1);
    });

    it('should have weekly change frequency for homepage', () => {
      const result = sitemap();
      const homepage = result[0];
      expect(homepage.changeFrequency).toBe('weekly');
    });

    it('should have a valid lastModified date', () => {
      const result = sitemap();
      const homepage = result[0];
      expect(homepage.lastModified).toBeInstanceOf(Date);
    });
  });

  describe('URL Configuration', () => {
    it('should use default URL when NEXT_PUBLIC_SITE_URL is not set', () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      // Re-import to get fresh module
      jest.isolateModules(() => {
        const sitemapFresh = require('@/app/sitemap').default;
        const result = sitemapFresh();
        expect(result[0].url).toContain('automagicly.com');
      });
    });

    it('should use environment URL when NEXT_PUBLIC_SITE_URL is set', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-domain.com';
      jest.isolateModules(() => {
        const sitemapFresh = require('@/app/sitemap').default;
        const result = sitemapFresh();
        expect(result[0].url).toBe('https://custom-domain.com');
      });
    });
  });

  describe('Valid Values', () => {
    it('should have valid changeFrequency values', () => {
      const validFrequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
      const result = sitemap();
      result.forEach((entry) => {
        expect(validFrequencies).toContain(entry.changeFrequency);
      });
    });

    it('should have priority between 0 and 1', () => {
      const result = sitemap();
      result.forEach((entry) => {
        expect(entry.priority).toBeGreaterThanOrEqual(0);
        expect(entry.priority).toBeLessThanOrEqual(1);
      });
    });

    it('should have valid URL format', () => {
      const result = sitemap();
      result.forEach((entry) => {
        expect(entry.url).toMatch(/^https?:\/\//);
      });
    });
  });
});
