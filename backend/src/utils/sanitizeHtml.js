/**
 * Lightweight and robust HTML sanitizer for rich text content
 * Strips dangerous executable tags, event handlers, and malicious protocols
 * while preserving safe rich text formatting.
 */
export function sanitizeHtml(dirty) {
  if (dirty === null || dirty === undefined) return '';
  if (typeof dirty !== 'string') return String(dirty);

  let clean = dirty;

  // 1. Remove dangerous executable/embedding blocks and their contents
  const dangerousTags = ['script', 'style', 'iframe', 'object', 'embed', 'applet', 'meta', 'link', 'base', 'form', 'noscript'];
  for (const tag of dangerousTags) {
    const regex = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
    clean = clean.replace(regex, '');
    // Also remove self-closing or lone opening tags
    const loneTagRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
    clean = clean.replace(loneTagRegex, '');
  }

  // 2. Remove all on* event handler attributes (e.g., onload, onclick, onerror)
  clean = clean.replace(/\s*on[a-z]+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '');

  // 3. Remove javascript:, vbscript:, and data:text/html protocols from href/src/action
  clean = clean.replace(/(href|src|action)\s*=\s*(["'])\s*(javascript|vbscript|data):[\s\S]*?\2/gi, '$1="#"');
  clean = clean.replace(/(href|src|action)\s*=\s*(javascript|vbscript|data):[^\s>]*/gi, '$1="#"');

  return clean.trim();
}

export default sanitizeHtml;
