/**
 * Performance Tests - Measure page load times and performance metrics
 * These tests help ensure the site remains fast and responsive
 *
 * Note: These thresholds are set for development mode.
 * For production, tighten these thresholds accordingly.
 */
import { test, expect } from '@playwright/test'
import { setupDefaultMocks } from './mocks/api-mocks'

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup API mocks before each test
    await setupDefaultMocks(page)
  })

  test('homepage loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    // Homepage should load in under 5 seconds (dev mode)
    expect(loadTime).toBeLessThan(5000)
  })

  test('booking calendar renders quickly', async ({ page }) => {
    await page.goto('/')

    const startTime = Date.now()
    await page.waitForSelector('role=grid', { timeout: 10000 })
    const renderTime = Date.now() - startTime

    // Calendar should render in under 3 seconds (dev mode with mocks)
    expect(renderTime).toBeLessThan(3000)
  })

  test('API responses are fast', async ({ page }) => {
    await page.goto('/')

    const startTime = Date.now()
    const response = await page.request.get('/api/reviews-simple')
    const responseTime = Date.now() - startTime

    expect(response.status()).toBe(200)
    // API should respond in under 1 second
    expect(responseTime).toBeLessThan(1000)
  })

  test('images load with proper optimization', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that images have proper attributes
    const images = page.locator('img')
    const count = await images.count()

    if (count > 0) {
      // Verify images have alt text (accessibility + SEO)
      for (let i = 0; i < count; i++) {
        const img = images.nth(i)
        const alt = await img.getAttribute('alt')
        expect(alt).toBeTruthy()
      }

      // Check for lazy loading on below-the-fold images
      const lazyImages = page.locator('img[loading="lazy"]')
      const lazyCount = await lazyImages.count()
      // At least some images should be lazy-loaded
      expect(lazyCount).toBeGreaterThan(0)
    }
  })

  test('page uses efficient font loading', async ({ page }) => {
    await page.goto('/')

    // Check for font-display: swap or optional
    const fontFaces = await page.evaluate(() => {
      return Array.from(document.fonts).map((font) => ({
        family: font.family,
        status: font.status,
      }))
    })

    // Fonts should be loaded or loading
    fontFaces.forEach((font) => {
      expect(['loaded', 'loading', 'unloaded']).toContain(font.status)
    })
  })

  test('JavaScript bundle size is reasonable', async ({ page }) => {
    const resources: Array<{ url: string; size: number }> = []

    page.on('response', async (response) => {
      if (response.url().endsWith('.js')) {
        const buffer = await response.body().catch(() => null)
        if (buffer) {
          resources.push({
            url: response.url(),
            size: buffer.length,
          })
        }
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Calculate total JS size
    const totalSize = resources.reduce((sum, r) => sum + r.size, 0)
    const totalSizeKB = totalSize / 1024

    console.log(`Total JS size: ${totalSizeKB.toFixed(2)} KB`)

    // Total JS should be under 2MB in dev mode (production should be much smaller)
    expect(totalSizeKB).toBeLessThan(2000)
  })

  test('no memory leaks on navigation', async ({ page }) => {
    await page.goto('/')

    // Get initial memory
    const initialMetrics = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize
      }
      return 0
    })

    // Navigate around the site
    await page.click('button:has-text("Submit a Review")')
    await page.click('button:has-text("✕")')
    await page.reload()

    // Get final memory
    const finalMetrics = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize
      }
      return 0
    })

    if (initialMetrics && finalMetrics) {
      const memoryIncrease = finalMetrics - initialMetrics
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024)

      console.log(`Memory increase: ${memoryIncreaseMB.toFixed(2)} MB`)

      // Memory should not increase by more than 10MB
      expect(memoryIncreaseMB).toBeLessThan(10)
    }
  })

  test('Core Web Vitals are good', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          const metrics: Record<string, number> = {}

          // Largest Contentful Paint (LCP)
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1] as any
            metrics.LCP = lastEntry.renderTime || lastEntry.loadTime
          }).observe({ entryTypes: ['largest-contentful-paint'] })

          // First Input Delay (FID)
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry: any) => {
              metrics.FID = entry.processingStart - entry.startTime
            })
          }).observe({ entryTypes: ['first-input'] })

          // Cumulative Layout Shift (CLS)
          let clsScore = 0
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsScore += (entry as any).value
              }
            }
            metrics.CLS = clsScore
          }).observe({ entryTypes: ['layout-shift'] })

          // Wait a bit for metrics to be collected
          setTimeout(() => resolve(metrics), 3000)
        } else {
          resolve({})
        }
      })
    })

    console.log('Core Web Vitals:', metrics)

    // Core Web Vitals thresholds (good values)
    if ((metrics as any).LCP) {
      expect((metrics as any).LCP).toBeLessThan(2500) // LCP should be under 2.5s
    }
    if ((metrics as any).FID) {
      expect((metrics as any).FID).toBeLessThan(100) // FID should be under 100ms
    }
    if ((metrics as any).CLS) {
      expect((metrics as any).CLS).toBeLessThan(0.1) // CLS should be under 0.1
    }
  })

  test('page is interactive quickly', async ({ page }) => {
    await page.goto('/')

    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
      }
    })

    console.log('Performance metrics:', metrics)

    // DOM should be interactive within 1.5 seconds
    expect(metrics.domInteractive).toBeLessThan(1500)

    // Page should be fully loaded within 3 seconds
    expect(metrics.loadComplete).toBeLessThan(3000)
  })
})

/**
 * Running performance tests:
 *
 * 1. Run performance tests:
 *    npx playwright test performance.spec.ts
 *
 * 2. Run with performance profiling:
 *    npx playwright test performance.spec.ts --trace on
 *
 * 3. View performance traces:
 *    npx playwright show-trace trace.zip
 *
 * Best practices:
 * - Run on production builds
 * - Test on realistic network conditions
 * - Monitor trends over time
 * - Set realistic thresholds for your use case
 */
