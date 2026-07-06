// Shared helpers for the business directory — used by the public directory,
// individual business pages, and the admin console so everything stays in sync.

export const BUSINESS_CATEGORIES = [
  'Dining',
  'Farm & Food',
  'Grocery & Market',
  'Retail',
  'Outdoors',
  'Services',
  'Lodging',
  'Health',
  'Beauty & Personal Care',
  'Auto',
  'Professional',
  'Faith',
];

// Turn a business name into a URL-safe slug, e.g. "Joe's Diner" -> "joes-diner".
export function slugify(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Normalize a website URL for display + href.
export function normalizeUrl(url) {
  if (!url) return null;
  const u = url.trim();
  if (!u) return null;
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

export function displayUrl(url) {
  if (!url) return '';
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}
