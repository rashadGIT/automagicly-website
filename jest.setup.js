// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL = 'https://test.webhook.url/booking'
process.env.NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL = 'https://test.webhook.url/reviews'
process.env.NEXT_PUBLIC_N8N_REFERRALS_WEBHOOK_URL = 'https://test.webhook.url/referrals'
process.env.NEXT_PUBLIC_N8N_WAITLIST_WEBHOOK_URL = 'https://test.webhook.url/waitlist'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock window.localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString()
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}
// Mock bad-words globally to avoid ES module issues
jest.mock('bad-words', () => {
  return {
    __esModule: true,
    Filter: class MockFilter {
      isProfane(text) {
        const badWords = ['fuck', 'shit', 'damn', 'bitch', 'ass'];
        return badWords.some(word => text.toLowerCase().includes(word));
      }
    },
    default: class MockFilter {
      isProfane(text) {
        const badWords = ['fuck', 'shit', 'damn', 'bitch', 'ass'];
        return badWords.some(word => text.toLowerCase().includes(word));
      }
    }
  };
});

// Mock window.scrollTo
global.scrollTo = jest.fn()
// Mock environment variables for testing
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-jest-testing-only'
process.env.ADMIN_EMAIL = 'test@example.com'
process.env.ADMIN_PASSWORD_HASH = '$2a$10$test.hash.for.testing.only'

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
    headers: new Headers(),
    redirected: false,
    statusText: 'OK',
    type: 'basic',
    url: '',
    clone: jest.fn(),
    body: null,
    bodyUsed: false,
  })
)

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}

// Ensure server-side secrets are NOT available in client-side tests
if (typeof window !== 'undefined') {
  // These should be undefined in browser environment
  delete process.env.GOOGLE_PRIVATE_KEY
  delete process.env.DB_SECRET_ACCESS_KEY
  delete process.env.DB_ACCESS_KEY_ID
}
