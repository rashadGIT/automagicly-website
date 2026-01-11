// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

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

// Mock environment variables for testing
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-jest-testing-only'
process.env.ADMIN_EMAIL = 'test@example.com'
process.env.ADMIN_PASSWORD_HASH = '$2a$10$test.hash.for.testing.only'

// Ensure server-side secrets are NOT available in client-side tests
if (typeof window !== 'undefined') {
  // These should be undefined in browser environment
  delete process.env.GOOGLE_PRIVATE_KEY
  delete process.env.DB_SECRET_ACCESS_KEY
  delete process.env.DB_ACCESS_KEY_ID
}
