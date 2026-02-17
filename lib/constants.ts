/**
 * Application-wide constants
 * Centralizes magic numbers and configuration values
 */

// Rate Limiting
export const RATE_LIMIT = {
  MAX_REQUESTS: 10,
  WINDOW_MS: 60000, // 1 minute
  CIRCUIT_BREAKER_THRESHOLD: 5,
  CIRCUIT_BREAKER_TIMEOUT: 60000, // 1 minute
} as const;

// Audit Configuration
export const AUDIT = {
  MAX_QUESTIONS: 15,
  HIGH_CONFIDENCE_THRESHOLD: 0.8,
  MEDIUM_CONFIDENCE_THRESHOLD: 0.6,
  PROCESSING_ANIMATION_DURATION: 5000, // 5 seconds
  MILESTONE_TOAST_DURATION: 3000, // 3 seconds
  EMAIL_SUCCESS_DISPLAY_DURATION: 2000, // 2 seconds
} as const;

// Chat Widget
export const CHAT = {
  MAX_MESSAGE_LENGTH: 2000,
  TYPING_INDICATOR_DELAY: 100, // ms per dot
} as const;

// API Request
export const API = {
  MAX_BODY_SIZE: 1024 * 1024, // 1MB
  DEFAULT_TIMEOUT: 30000, // 30 seconds
} as const;

// Test Configuration
export const TEST = {
  TIMEOUT: 10000, // 10 seconds
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// File Upload
export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'] as const,
} as const;

// Session
export const SESSION = {
  MAX_AGE: 30 * 24 * 60 * 60, // 30 days in seconds
  UPDATE_AGE: 24 * 60 * 60, // 24 hours in seconds
} as const;

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
} as const;

// ROI Calculator Defaults
export const ROI_DEFAULTS = {
  TIME_PER_TASK: 15, // minutes
  TIMES_PER_WEEK: 20,
  NUMBER_OF_PEOPLE: 1,
  HOURLY_COST: 35, // dollars
  EFFICIENCY_GAIN: 70, // percent
  WEEKS_PER_MONTH: 4.33,
} as const;

// Build Cost Presets
export const BUILD_COST_PRESETS = {
  LOW: 500,
  MEDIUM: 1500,
  HIGH: 3000,
} as const;

// Animation Delays
export const ANIMATION = {
  STAGGER_DELAY: 0.1, // seconds
  FADE_DURATION: 0.6, // seconds
  SCALE_DURATION: 0.4, // seconds
  SPARKLE_DURATION: 600, // milliseconds
} as const;

// Colors (for programmatic use)
export const COLORS = {
  BRAND: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
} as const;
