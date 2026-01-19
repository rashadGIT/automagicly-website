// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { randomUUID } from 'crypto'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill TextEncoder/TextDecoder for API route tests
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Polyfill Web APIs for Next.js API route tests (Request, Response, Headers)
class MockHeaders {
  constructor(init) {
    this.headers = new Map()
    if (init) {
      if (init instanceof MockHeaders || init instanceof Map) {
        init.forEach((value, key) => this.headers.set(key.toLowerCase(), value))
      } else if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.headers.set(key.toLowerCase(), value))
      } else if (typeof init === 'object') {
        Object.entries(init).forEach(([key, value]) => this.headers.set(key.toLowerCase(), value))
      }
    }
  }
  append(name, value) {
    const key = name.toLowerCase()
    const existing = this.headers.get(key)
    this.headers.set(key, existing ? `${existing}, ${value}` : value)
  }
  delete(name) { this.headers.delete(name.toLowerCase()) }
  get(name) { return this.headers.get(name.toLowerCase()) ?? null }
  has(name) { return this.headers.has(name.toLowerCase()) }
  set(name, value) { this.headers.set(name.toLowerCase(), value) }
  forEach(cb) { this.headers.forEach((value, key) => cb(value, key, this)) }
  entries() { return this.headers.entries() }
  keys() { return this.headers.keys() }
  values() { return this.headers.values() }
  [Symbol.iterator]() { return this.headers.entries() }
  getSetCookie() { const c = this.headers.get('set-cookie'); return c ? [c] : [] }
}

class MockRequest {
  constructor(input, init = {}) {
    // Use internal _url to allow NextRequest to set url via getter/setter
    this._url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input?.url || ''
    this._method = init.method ?? 'GET'
    this._headers = new MockHeaders(init.headers)
    this._body = init.body ? (typeof init.body === 'string' ? init.body : JSON.stringify(init.body)) : null
    this._cache = 'default'
    this._credentials = 'same-origin'
    this._destination = ''
    this._integrity = ''
    this._keepalive = false
    this._mode = 'cors'
    this._redirect = 'follow'
    this._referrer = ''
    this._referrerPolicy = ''
    this._signal = new AbortController().signal
    this._bodyStream = null
    this._bodyUsed = false
  }
  get url() { return this._url }
  set url(value) { this._url = value }
  get method() { return this._method }
  set method(value) { this._method = value }
  get headers() { return this._headers }
  set headers(value) { this._headers = value }
  get cache() { return this._cache }
  set cache(value) { this._cache = value }
  get credentials() { return this._credentials }
  set credentials(value) { this._credentials = value }
  get destination() { return this._destination }
  set destination(value) { this._destination = value }
  get integrity() { return this._integrity }
  set integrity(value) { this._integrity = value }
  get keepalive() { return this._keepalive }
  set keepalive(value) { this._keepalive = value }
  get mode() { return this._mode }
  set mode(value) { this._mode = value }
  get redirect() { return this._redirect }
  set redirect(value) { this._redirect = value }
  get referrer() { return this._referrer }
  set referrer(value) { this._referrer = value }
  get referrerPolicy() { return this._referrerPolicy }
  set referrerPolicy(value) { this._referrerPolicy = value }
  get signal() { return this._signal }
  set signal(value) { this._signal = value }
  get body() { return this._bodyStream }
  set body(value) { this._bodyStream = value }
  get bodyUsed() { return this._bodyUsed }
  set bodyUsed(value) { this._bodyUsed = value }
  clone() { return new MockRequest(this._url, { method: this._method, headers: this._headers, body: this._body }) }
  async arrayBuffer() { return new TextEncoder().encode(this._body ?? '').buffer }
  async blob() { return new Blob([this._body ?? '']) }
  async formData() { return new FormData() }
  async json() { return JSON.parse(this._body ?? '{}') }
  async text() { return this._body ?? '' }
  async bytes() { return new TextEncoder().encode(this._body ?? '') }
}

class MockResponse {
  constructor(body, init = {}) {
    // Handle body: can be string, object, null, ReadableStream, or another Response
    if (body instanceof MockResponse) {
      this._body = body._body
    } else if (body && typeof body.getReader === 'function') {
      // ReadableStream - we'll need to handle this specially
      this._body = init._bodyString || ''
    } else if (typeof body === 'string') {
      this._body = body
    } else if (body !== null && body !== undefined) {
      this._body = JSON.stringify(body)
    } else {
      this._body = ''
    }
    this._status = init.status ?? 200
    this._statusText = init.statusText ?? 'OK'
    this._ok = this._status >= 200 && this._status < 300
    this._headers = new MockHeaders(init.headers)
    this._type = 'basic'
    this._url = ''
    this._redirected = false
    this._bodyStream = null
    this._bodyUsed = false
  }
  get status() { return this._status }
  set status(value) { this._status = value }
  get statusText() { return this._statusText }
  set statusText(value) { this._statusText = value }
  get ok() { return this._ok }
  set ok(value) { this._ok = value }
  get headers() { return this._headers }
  set headers(value) { this._headers = value }
  get type() { return this._type }
  set type(value) { this._type = value }
  get url() { return this._url }
  set url(value) { this._url = value }
  get redirected() { return this._redirected }
  set redirected(value) { this._redirected = value }
  get body() { return this._bodyStream }
  set body(value) { this._bodyStream = value }
  get bodyUsed() { return this._bodyUsed }
  set bodyUsed(value) { this._bodyUsed = value }
  clone() { return new MockResponse(this._body, { status: this._status, statusText: this._statusText, headers: this._headers }) }
  async arrayBuffer() { return new TextEncoder().encode(this._body).buffer }
  async blob() { return new Blob([this._body]) }
  async formData() { return new FormData() }
  async json() { return this._body ? JSON.parse(this._body) : null }
  async text() { return this._body }
  async bytes() { return new TextEncoder().encode(this._body) }
  static error() { return new MockResponse(null, { status: 0, statusText: '' }) }
  static redirect(url, status = 302) { return new MockResponse(null, { status, headers: { Location: url.toString() } }) }
  static json(data, init = {}) {
    const headers = new MockHeaders(init.headers)
    headers.set('content-type', 'application/json')
    const bodyString = JSON.stringify(data)
    return new MockResponse(bodyString, { ...init, headers, _bodyString: bodyString })
  }
}

// Set globals for API route tests
if (typeof global.Request === 'undefined') global.Request = MockRequest
if (typeof global.Response === 'undefined') global.Response = MockResponse
if (typeof global.Headers === 'undefined') global.Headers = MockHeaders

// Polyfill crypto.randomUUID for Node 18 test environment
// Node 18 may not have crypto.randomUUID available in global scope
if (typeof global.crypto === 'undefined') {
  global.crypto = {}
}
if (typeof global.crypto.randomUUID !== 'function') {
  global.crypto.randomUUID = randomUUID
}

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

// Only define window properties if we're in a browser-like environment
if (typeof window !== 'undefined') {
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
}

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
