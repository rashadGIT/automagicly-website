// Sanitization utility with production build support
// This file handles the DOMPurify import issue with Next.js

let DOMPurify: any;
let domPurifyPromise: Promise<any> | null = null;

// Initialize DOMPurify based on environment
if (typeof window !== 'undefined') {
  // Client-side: use regular import
  domPurifyPromise = import('isomorphic-dompurify').then(module => {
    DOMPurify = module.default;
    return module.default;
  });
} else {
  // Server-side: use dynamic import to avoid build issues
  domPurifyPromise = import('isomorphic-dompurify').then(module => {
    DOMPurify = module.default;
    return module.default;
  }).catch(() => {
    // Fallback: basic sanitization if DOMPurify fails to load
    DOMPurify = {
      sanitize: (dirty: string) => {
        // Remove all HTML tags as fallback
        return dirty.replace(/<[^>]*>/g, '');
      }
    };
    return DOMPurify;
  });
}

/**
 * Sanitize HTML to prevent XSS attacks
 * Safe for both server-side and client-side rendering
 */
export async function sanitizeHtmlAsync(dirty: string): Promise<string> {
  // Wait for DOMPurify to load if needed
  if (!DOMPurify && domPurifyPromise) {
    try {
      await domPurifyPromise;
    } catch (error) {
      // Use basic fallback - no logging needed as this is expected in some environments
    }
  }

  if (!DOMPurify || typeof DOMPurify.sanitize !== 'function') {
    // Fallback: HTML entity encoding
    return dirty
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML tags allowed - plain text only
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
}

/**
 * Synchronous sanitization (for backwards compatibility)
 * Uses basic regex fallback if DOMPurify not loaded
 */
export function sanitizeHtmlSync(dirty: string): string {
  if (!dirty) return '';

  if (DOMPurify && typeof DOMPurify.sanitize === 'function') {
    try {
      return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true
      });
    } catch (e) {
      // Fallback on error
    }
  }

  // Fallback: basic HTML stripping
  return dirty
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Default export for convenience
export const sanitizeHtml = sanitizeHtmlSync;
