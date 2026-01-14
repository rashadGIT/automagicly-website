# Testing Guide

This project has comprehensive test coverage including unit tests, component tests, integration tests, API tests, E2E tests, visual regression tests, contract tests, performance tests, and smoke tests.

## Test Stack

- **Jest**: Unit and component testing
- **React Testing Library**: Component testing utilities
- **Playwright**: End-to-end testing
- **MSW** (Mock Service Worker): API mocking
- **@axe-core/playwright**: Accessibility testing

## Running Tests

### All Tests

```bash
npm run test:all
```

### Unit & Component Tests

```bash
# Run all unit and component tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug

# Install Playwright browsers (one-time setup)
npm run playwright:install
```

## Test Structure

```
automagicly/
├── __tests__/                  # Unit and component tests
│   ├── lib/                   # Utility function tests
│   │   └── utils.test.ts      # ✅ 24 tests
│   ├── components/            # React component tests
│   │   └── Reviews.test.tsx   # ✅ 13 tests
│   ├── app/api/              # API route tests
│   │   └── reviews-simple.test.ts
│   ├── integration/          # Integration tests
│   │   └── booking-flow.test.tsx
│   ├── contract/             # Contract tests
│   │   └── n8n-webhooks.test.ts
│   └── utils/                # Test helpers and utilities
│       ├── test-utils.tsx
│       └── mock-helpers.ts
├── e2e/                      # End-to-end tests
│   ├── booking.spec.ts        # Booking flow E2E
│   ├── reviews.spec.ts        # Reviews flow E2E
│   ├── visual-regression.spec.ts  # Screenshot tests
│   ├── smoke.spec.ts          # Quick sanity checks
│   └── performance.spec.ts    # Performance metrics
├── jest.config.js            # Jest configuration
├── jest.setup.js             # Jest setup and global mocks
└── playwright.config.ts      # Playwright configuration
```

## Test Coverage

### Current Coverage

Run `npm run test:coverage` to see detailed coverage report.

**Coverage Thresholds:**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Coverage Reports

After running tests with coverage, open:
- `coverage/lcov-report/index.html` - Interactive HTML report

## Writing Tests

### Unit Tests

Unit tests are located in `__tests__/lib/` and test individual functions:

```typescript
import { formatCurrency } from '@/lib/utils'

describe('formatCurrency', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000')
  })
})
```

### Component Tests

Component tests are in `__tests__/components/`:

```typescript
import { render, screen } from '../utils/test-utils'
import Reviews from '@/components/Reviews'

describe('Reviews Component', () => {
  it('should render the reviews section', () => {
    render(<Reviews />)
    expect(screen.getByText('Client Reviews')).toBeInTheDocument()
  })
})
```

### E2E Tests

E2E tests are in `e2e/` and test complete user flows:

```typescript
import { test, expect } from '@playwright/test'

test('should complete booking flow', async ({ page }) => {
  await page.goto('/')
  // ... interact with the page
  await expect(page.locator('text=Booking Confirmed')).toBeVisible()
})
```

## Mocking

### API Mocking

Use the mock helpers in `__tests__/utils/mock-helpers.ts`:

```typescript
import { mockWebhookSuccess, mockReviewsResponse } from '../utils/mock-helpers'

mockWebhookSuccess() // Mock successful webhook response
mockReviewsResponse([...reviews]) // Mock reviews API response
```

### Environment Variables

Test environment variables are mocked in `jest.setup.js`:

```javascript
process.env.NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL = 'https://test.webhook.url/booking'
```

## Continuous Integration

Tests run automatically on GitHub Actions for:
- Push to master/main/develop branches
- Pull requests to master/main/develop

### CI Workflow

The CI pipeline runs:
1. **Unit & Component Tests** - On Node 18.x and 20.x
2. **E2E Tests** - Full browser testing
3. **Lint** - Code style checks
4. **Build** - Verify production build

View the workflow in `.github/workflows/test.yml`

## Best Practices

### 1. Test Naming

Use descriptive test names that explain what is being tested:

```typescript
it('should display error message when email is invalid', () => {
  // ...
})
```

### 2. Arrange-Act-Assert

Follow the AAA pattern:

```typescript
it('should submit review with valid data', async () => {
  // Arrange
  render(<Reviews />)

  // Act
  await userEvent.type(emailInput, 'test@example.com')
  await userEvent.click(submitButton)

  // Assert
  expect(screen.getByText('Thank You!')).toBeVisible()
})
```

### 3. Avoid Testing Implementation Details

Test behavior, not implementation:

```typescript
// ❌ Bad - testing implementation
expect(component.state.isLoading).toBe(true)

// ✅ Good - testing behavior
expect(screen.getByText('Loading...')).toBeVisible()
```

### 4. Use User-Centric Queries

Prefer queries that reflect how users interact:

```typescript
// ✅ Good
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')
screen.getByText('Success!')

// ❌ Avoid
screen.getByTestId('submit-btn')
```

### 5. Clean Up After Tests

```typescript
afterEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
})
```

## Debugging Tests

### Jest Tests

```bash
# Run specific test file
npm test -- path/to/test.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should submit"

# Debug in VS Code
# Add breakpoint and use "Jest: Debug" configuration
```

### Playwright Tests

```bash
# Run with UI mode
npm run test:e2e:ui

# Debug mode (opens inspector)
npm run test:e2e:debug

# Run specific test
npx playwright test e2e/booking.spec.ts
```

## Accessibility Testing

E2E tests include automated accessibility checks using axe-core:

```typescript
import { injectAxe, checkA11y } from 'axe-playwright'

test('should pass accessibility checks', async ({ page }) => {
  await page.goto('/')
  await injectAxe(page)
  await checkA11y(page)
})
```

## Test Data

### Mock Data

Keep test data in test files or separate fixtures:

```typescript
const mockReviews: ReviewFormData[] = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    rating: 5,
    reviewText: 'Great service!',
    // ...
  },
]
```

### Test Users

Use consistent test data:
- Email: `test@example.com`, `e2e@example.com`
- Name: `Test User`, `E2E Test User`
- Company: `Test Company`

## Troubleshooting

### Tests Timing Out

Increase timeout for slow tests:

```typescript
test('slow test', async ({ page }) => {
  // ...
}, { timeout: 30000 }) // 30 seconds
```

### Flaky Tests

- Add explicit waits: `await page.waitForSelector()`
- Use `waitFor` from Testing Library
- Avoid hard-coded delays like `setTimeout`

### Mock Not Working

- Check mock is imported before the module it mocks
- Verify mock data matches expected shape
- Clear mocks between tests with `jest.clearAllMocks()`

## Test Types Explained

### 1. Unit Tests (`__tests__/lib/`)
**Purpose**: Test individual functions in isolation
**Example**: Testing `formatCurrency()` formats numbers correctly
**Run**: `npm test -- __tests__/lib/`

### 2. Component Tests (`__tests__/components/`)
**Purpose**: Test React components in isolation
**Example**: Testing Reviews component renders and handles form submission
**Run**: `npm test -- __tests__/components/`

### 3. Integration Tests (`__tests__/integration/`)
**Purpose**: Test multiple components/modules working together
**Example**: Testing full booking flow from calendar to confirmation
**Run**: `npm test -- __tests__/integration/`

### 4. API Route Tests (`__tests__/app/api/`)
**Purpose**: Test Next.js API endpoints
**Example**: Testing `/api/reviews-simple` returns correct data structure
**Run**: `npm test -- __tests__/app/api/`

### 5. Contract Tests (`__tests__/contract/`)
**Purpose**: Verify data contracts with external services
**Example**: Ensuring n8n webhook receives data in expected format
**Run**: `npm test -- __tests__/contract/`
**Why Important**: Prevents integration failures with external APIs

### 6. E2E Tests (`e2e/*.spec.ts`)
**Purpose**: Test complete user journeys in real browser
**Example**: User books appointment from start to finish
**Run**: `npm run test:e2e`

### 7. Visual Regression Tests (`e2e/visual-regression.spec.ts`)
**Purpose**: Detect unintended UI changes via screenshot comparison
**Example**: Comparing homepage screenshots before/after changes
**Run**: `npx playwright test visual-regression.spec.ts`
**Update Snapshots**: `npx playwright test visual-regression.spec.ts --update-snapshots`

### 8. Smoke Tests (`e2e/smoke.spec.ts`)
**Purpose**: Quick sanity checks for critical functionality
**Example**: Verify homepage loads, booking section works
**Run**: `npx playwright test smoke.spec.ts`
**When**: After each deployment to production

### 9. Performance Tests (`e2e/performance.spec.ts`)
**Purpose**: Measure page load times and Core Web Vitals
**Example**: Verify LCP < 2.5s, FID < 100ms, CLS < 0.1
**Run**: `npx playwright test performance.spec.ts`
**Why Important**: Ensures site remains fast for users

## Advanced Testing Scenarios

### Visual Regression Testing
```bash
# Generate baseline screenshots
npx playwright test visual-regression.spec.ts

# Compare against baseline (fails if different)
npx playwright test visual-regression.spec.ts

# Update baselines after intentional changes
npx playwright test visual-regression.spec.ts --update-snapshots

# View visual diffs
open playwright-report/index.html
```

### Contract Testing
Contract tests verify the data you send to external services matches their expectations:

```typescript
// Verify booking webhook sends correct fields
expect(webhookData).toHaveProperty('dateTimeISO')
expect(typeof webhookData.rating).toBe('number')
expect(webhookData.email).toMatch(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
```

### Smoke Tests in Production
Run smoke tests immediately after deployment:

```bash
# Against production URL
PLAYWRIGHT_TEST_BASE_URL=https://automagicly.com npx playwright test smoke.spec.ts

# Quick verification (< 2 minutes)
# Catches critical issues immediately
```

### Performance Monitoring
Track performance metrics over time:

```bash
# Run performance tests and save results
npx playwright test performance.spec.ts --reporter=json > perf-results.json

# Monitor trends: LCP, FID, CLS
# Alert if metrics degrade
```

## Test Type Decision Tree

**When to use each test type:**

- **Unit Test**: Testing a single function/utility
  → Example: `formatCurrency(1000)` returns `"$1,000"`

- **Component Test**: Testing a React component
  → Example: Reviews form validates email field

- **Integration Test**: Testing multiple components together
  → Example: Calendar + time slots + contact form

- **API Test**: Testing Next.js API routes
  → Example: `/api/reviews-simple` returns reviews array

- **Contract Test**: Verifying external API contracts
  → Example: n8n webhook receives expected fields

- **E2E Test**: Testing complete user journeys
  → Example: User books appointment end-to-end

- **Visual Regression**: Preventing unintended UI changes
  → Example: Catch accidental CSS changes

- **Smoke Test**: Quick production verification
  → Example: Critical features work after deployment

- **Performance Test**: Measuring speed and Core Web Vitals
  → Example: Homepage loads in < 3 seconds

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Contract Testing Guide](https://pactflow.io/blog/what-is-contract-testing/)
- [Visual Regression Testing](https://playwright.dev/docs/test-snapshots)
- [Web Vitals](https://web.dev/vitals/)

## Contributing

When adding new features:

1. Write tests for new functionality
2. Ensure existing tests pass
3. Maintain test coverage above 70%
4. Add E2E tests for critical user flows
5. Update visual regression baselines if UI changes
6. Add contract tests for external integrations
7. Run smoke tests before merging to main
8. Run full test suite before submitting PR
