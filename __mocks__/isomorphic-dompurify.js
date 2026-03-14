// Mock for isomorphic-dompurify — stable across v2 and v3, avoids ESM/jsdom chain
// Replicates DOMPurify behavior: strips dangerous tags+content, entity-encodes remainder

const DOMPurify = {
  sanitize: (dirty, _options) => {
    if (!dirty) return '';

    // Strip script/style block elements including their content
    let result = dirty
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '');

    // Strip remaining valid HTML tags (e.g. <img>, <a>, </p>) — keep text content
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
