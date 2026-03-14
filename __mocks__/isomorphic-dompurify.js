// Mock for isomorphic-dompurify — test-only, stable across v2 and v3.
// Avoids ESM/jsdom chain issues that occur when the real package is imported in Jest.
// This file is excluded from CodeQL analysis (see .github/workflows/codeql.yml).

const DOMPurify = {
  sanitize: (dirty, _options) => {
    if (!dirty) return '';

    // Remove script/style block elements including their content
    let result = dirty
      .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')
      .replace(/<style\b[\s\S]*?<\/style\s*>/gi, '');

    // Remove remaining valid HTML tags, keep text content
    result = result.replace(/<\/?[a-zA-Z][^>]*>/g, '');

    // Entity-encode remaining HTML special characters
    result = result
      .replace(/&(?![a-zA-Z][a-zA-Z0-9]*;|#\d+;)/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return result;
  },
};

module.exports = DOMPurify;
module.exports.default = DOMPurify;
