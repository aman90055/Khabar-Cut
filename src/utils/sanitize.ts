import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'span',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code', 'img'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class'],
  }) as string;
}

export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }) as string;
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[^\w\s\-\"\']/g, '')
    .trim();
}

export function sanitizeFileName(name: string): string {
  const sanitized = name.replace(/[^a-zA-Z0-9\-_.]/g, '_');
  return sanitized.replace(/^\.+/g, '');
}
