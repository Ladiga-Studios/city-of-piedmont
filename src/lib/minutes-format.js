// Shared helpers for formatting council-minutes titles consistently
// across the public minutes page, the admin dashboard, and bulk upload.

const MONTHS_FULL = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export function fmtMeetingDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

// Pull a meaningful descriptor (e.g. "Special Called Meeting") out of a stored
// title, dropping the redundant "MINUTES" prefix and the date itself. Regular
// meetings return '' so callers can show just the date.
export function descriptorFromTitle(title) {
  if (!title) return '';
  return title.trim()
    .replace(/^minutes\b/i, '')
    .replace(/^[\s\-–—:]+/, '')
    .replace(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i, '')
    .replace(/^[\s\-–—:,]+|[\s\-–—:,]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Build a clean, consistent stored title from a date + optional descriptor.
// Used when staff upload via the console so titles are uniform going forward.
// Format mirrors the existing data: "MINUTES <MONTH> <D>, <YYYY>[ <descriptor>]"
export function buildTitle(dateStr, descriptor) {
  if (!dateStr) return descriptor || 'City Council Meeting';
  const d = new Date(dateStr + 'T00:00:00');
  const datePart = `${MONTHS_FULL[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  const desc = (descriptor || '').trim();
  return desc ? `MINUTES ${datePart} ${desc}` : `MINUTES ${datePart}`;
}
