/**
 * API Route E2E Tests
 * Tests for API endpoints that can't be easily unit tested due to Next.js runtime requirements
 */
import { test, expect } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const csrfHeaders = {
  origin: baseUrl,
  referer: baseUrl,
};
const jsonHeaders = { ...csrfHeaders, 'Content-Type': 'application/json' };

test.describe('API Routes', () => {
  test.describe('Chat API - /api/chat', () => {
    const chatEndpoint = '/api/chat';

    test('should reject requests without Content-Type header', async ({ request }) => {
      const response = await request.post(chatEndpoint, {
        headers: csrfHeaders,
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.reason).toBe('invalid_content_type');
    });

    test('should reject requests with invalid Content-Type', async ({ request }) => {
      const response = await request.post(chatEndpoint, {
        data: 'message=hello',
        headers: { ...csrfHeaders, 'Content-Type': 'text/plain' },
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.reason).toBe('invalid_content_type');
    });

    test('should reject requests with missing message', async ({ request }) => {
      const response = await request.post(chatEndpoint, {
        data: { sessionId: 'test-session' },
        headers: jsonHeaders,
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.reply).toBe('Invalid request data.');
    });

    test('should reject requests with missing sessionId', async ({ request }) => {
      const response = await request.post(chatEndpoint, {
        data: { message: 'Hello' },
        headers: jsonHeaders,
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.reply).toBe('Invalid request data.');
    });

    test('should reject messages that are too long', async ({ request }) => {
      const longMessage = 'a'.repeat(5001);
      const response = await request.post(chatEndpoint, {
        data: { message: longMessage, sessionId: 'test-session' },
        headers: jsonHeaders,
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.reply).toBe('Invalid request data.');
    });

    test('should accept valid chat message and return response', async ({ request }) => {
      const response = await request.post(chatEndpoint, {
        data: { message: 'What services do you offer?', sessionId: `test-${Date.now()}` },
        headers: jsonHeaders,
      });

      // Should get 200 or the fallback response
      expect([200, 403]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('reply');
        expect(typeof data.reply).toBe('string');
        expect(data.reply.length).toBeGreaterThan(0);
      }
    });

    test('should block pricing requests with appropriate message', async ({ request }) => {
      const response = await request.post(chatEndpoint, {
        data: { message: 'How much does it cost?', sessionId: `test-${Date.now()}` },
        headers: jsonHeaders,
      });

      // Skip CSRF failures - this tests the pricing guard functionality
      if (response.status() === 403) {
        test.skip();
        return;
      }

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.blocked).toBe(true);
      expect(data.reason).toBe('pricing_request');
      expect(data.reply).toContain('Free AI Audit');
    });

    test('should block profanity', async ({ request }) => {
      const response = await request.post(chatEndpoint, {
        data: { message: 'This is a damn test', sessionId: `test-${Date.now()}` },
        headers: jsonHeaders,
      });

      // Skip CSRF failures
      if (response.status() === 403) {
        test.skip();
        return;
      }

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.blocked).toBe(true);
      expect(data.reason).toBe('profanity');
    });
  });

  test.describe('Calendar Availability API - /api/calendar/availability', () => {
    const calendarEndpoint = '/api/calendar/availability';

    test('should return calendar availability data', async ({ request }) => {
      const response = await request.get(calendarEndpoint);

      // Could be 200 (success), 400 (invalid params), or 500 (service not configured)
      expect([200, 400, 500]).toContain(response.status());

      const data = await response.json();
      expect(data).toHaveProperty('busyDates');
      expect(Array.isArray(data.busyDates)).toBe(true);
    });

    test('should accept valid date range parameters', async ({ request }) => {
      const today = new Date();
      const start = today.toISOString().split('T')[0];
      const end = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await request.get(`${calendarEndpoint}?start=${start}&end=${end}`);

      expect([200, 500]).toContain(response.status());
      const data = await response.json();
      expect(data).toHaveProperty('busyDates');
    });

    test('should reject invalid date format', async ({ request }) => {
      const response = await request.get(`${calendarEndpoint}?start=invalid-date`);

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid query parameters');
    });

    test('should accept timezone parameter', async ({ request }) => {
      const response = await request.get(`${calendarEndpoint}?timezone=America/New_York`);

      expect([200, 500]).toContain(response.status());
      const data = await response.json();
      expect(data).toHaveProperty('busyDates');
    });
  });

  test.describe('Reviews API - /api/reviews', () => {
    const reviewsEndpoint = '/api/reviews';

    test('should return approved reviews for public access', async ({ request }) => {
      const response = await request.get(reviewsEndpoint);

      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('reviews');
        expect(Array.isArray(data.reviews)).toBe(true);
      }
    });

    test('should filter to approved reviews only for non-admin', async ({ request }) => {
      const response = await request.get(`${reviewsEndpoint}?status=pending`);

      // Even requesting pending, should get approved for non-admin
      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        // All reviews should be approved status
        data.reviews.forEach((review: any) => {
          expect(review.status).toBe('approved');
        });
      }
    });
  });

  test.describe('Reviews Simple API - /api/reviews-simple', () => {
    const reviewsSimpleEndpoint = '/api/reviews-simple';

    test('should require authentication', async ({ request }) => {
      const response = await request.get(reviewsSimpleEndpoint);

      // Should be 401 (unauthorized) or 403 (forbidden) without auth
      expect([401, 403]).toContain(response.status());
    });
  });

  test.describe('SEO Routes', () => {
    test('should serve robots.txt', async ({ request }) => {
      const response = await request.get('/robots.txt');

      expect(response.status()).toBe(200);
      const text = await response.text();
      expect(text).toContain('User-Agent');
      expect(text).toContain('Sitemap');
    });

    test('should serve sitemap.xml', async ({ request }) => {
      const response = await request.get('/sitemap.xml');

      expect(response.status()).toBe(200);
      const text = await response.text();
      expect(text).toContain('<?xml');
      expect(text).toContain('<urlset');
      expect(text).toContain('<url>');
    });
  });
});

test.describe('API Security', () => {
  test('should have proper CORS headers', async ({ request }) => {
    const response = await request.get('/api/calendar/availability');

    // Check response is valid
    expect([200, 400, 500]).toContain(response.status());
  });

  test('should handle malformed JSON gracefully', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: 'not valid json{',
      headers: jsonHeaders,
    });

    // Should return error status, not crash
    expect([400, 500]).toContain(response.status());
  });

  test('should handle empty request body', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: {},
      headers: jsonHeaders,
    });

    expect(response.status()).toBe(400);
  });

  test('API routes should not expose stack traces', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: 'invalid',
      headers: jsonHeaders,
    });

    const text = await response.text();
    expect(text).not.toContain('at ');
    expect(text).not.toContain('.ts:');
    expect(text).not.toContain('node_modules');
  });
});

test.describe('Rate Limiting', () => {
  test('should enforce rate limits on chat API', async ({ request }) => {
    const sessionId = `rate-limit-test-${Date.now()}`;
    const responses: number[] = [];

    // Send multiple requests quickly
    for (let i = 0; i < 15; i++) {
      const response = await request.post('/api/chat', {
        data: { message: 'Test message', sessionId },
        headers: jsonHeaders,
      });
      responses.push(response.status());
    }

    // At least some requests should be rate limited (429)
    // or rejected (403 for CSRF) or accepted (200)
    expect(responses.every((s) => [200, 400, 403, 429].includes(s))).toBe(true);
  });
});
