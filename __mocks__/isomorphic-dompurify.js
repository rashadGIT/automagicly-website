// Mock for isomorphic-dompurify — test-only, stable across v2 and v3.
// Avoids ESM/jsdom chain issues that occur when the real package is imported in Jest.
// CodeQL suppression below is intentional: this is a test mock, not production sanitization.

const DOMPurify = {
  sanitize: (dirty, _options) => {
    if (!dirty) return '';

    // Remove script/style blocks and their content
    // lgtm[js/incomplete-multi-character-sanitization, js/bad-html-filtering-regexp]
    let result = dirty
      .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '') // lgtm[js/bad-html-filtering-regexp, js/incomplete-multi-character-sanitization]
      .replace(/<style\b[\s\S]*?<\/style\s*>/gi, ''); // lgtm[js/incomplete-multi-character-sanitization]

    // Remove remaining valid HTML tags, keep text content
    result = result.replace(/<\/?[a-zA-Z][^>]*>/g, ''); // lgtm[js/incomplete-multi-character-sanitization]

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
