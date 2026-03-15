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

    it('should include the homepage as the first entry', () => {
      const result = sitemap();
      expect(result[0].url).toMatch(/^https?:\/\/[^/]+\/?$/);
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

    it('should have 5 entries total', () => {
      const result = sitemap();
      expect(result).toHaveLength(5);
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

  describe('Section Entries', () => {
    it('should include /#services section', () => {
      const result = sitemap();
      const services = result.find((e) => e.url.includes('/#services'));
      expect(services).toBeDefined();
      expect(services?.priority).toBe(0.9);
      expect(services?.changeFrequency).toBe('monthly');
    });

    it('should include /#booking section', () => {
      const result = sitemap();
      const booking = result.find((e) => e.url.includes('/#booking'));
      expect(booking).toBeDefined();
      expect(booking?.priority).toBe(0.9);
      expect(booking?.changeFrequency).toBe('monthly');
    });

    it('should include /#reviews section', () => {
      const result = sitemap();
      const reviews = result.find((e) => e.url.includes('/#reviews'));
      expect(reviews).toBeDefined();
      expect(reviews?.priority).toBe(0.8);
      expect(reviews?.changeFrequency).toBe('weekly');
    });

    it('should include /#coming-soon section', () => {
      const result = sitemap();
      const comingSoon = result.find((e) => e.url.includes('/#coming-soon'));
      expect(comingSoon).toBeDefined();
      expect(comingSoon?.priority).toBe(0.7);
      expect(comingSoon?.changeFrequency).toBe('monthly');
    });
  });

  describe('URL Configuration', () => {
    it('should use automagicly.ai as the default domain', () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      jest.isolateModules(() => {
        const sitemapFresh = require('@/app/sitemap').default;
        const result = sitemapFresh();
        expect(result[0].url).toContain('automagicly.ai');
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

    it('should prefix all section URLs with the site URL', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
      jest.isolateModules(() => {
        const sitemapFresh = require('@/app/sitemap').default;
        const result = sitemapFresh();
        const sectionEntries = result.filter((e: { url: string }) => e.url.includes('/#'));
        sectionEntries.forEach((entry: { url: string }) => {
          expect(entry.url).toMatch(/^https:\/\/example\.com\/#/);
        });
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
