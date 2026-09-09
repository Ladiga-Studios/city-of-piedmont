// Shared helpers for the News & Events features.
// Used by the public /news and /events pages, the homepage,
// and the /admin/news and /admin/events consoles.

export const EVENT_CATEGORIES = [
  { value: 'community', label: 'Community' },
  { value: 'meeting', label: 'Government Meeting' },
  { value: 'festival', label: 'Festival' },
  { value: 'recreation', label: 'Recreation' },
  { value: 'holiday', label: 'Holiday' },
];

export function eventCategoryLabel(value) {
  return EVENT_CATEGORIES.find((c) => c.value === value)?.label || 'Community';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Parse a stored timestamp into parts without timezone surprises.
// Stored values look like "2026-07-04 16:00" or ISO "2026-07-04T16:00:00".
export function parseEventDate(value) {
  if (!value) return null;
  const iso = value.includes('T') ? value : value.replace(' ', 'T');
  const d = new Date(iso);
  if (isNaN(d)) return null;
  return d;
}

export function eventMonthAbbr(value) {
  const d = parseEventDate(value);
  return d ? MONTHS[d.getMonth()] : '';
}

export function eventDayNum(value) {
  const d = parseEventDate(value);
  return d ? String(d.getDate()).padStart(2, '0') : '';
}

// "4:00 PM" - empty when the event is all-day or has no meaningful time.
export function eventTime(value, allDay) {
  if (allDay) return '';
  const d = parseEventDate(value);
  if (!d) return '';
  if (d.getHours() === 0 && d.getMinutes() === 0) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// "July 4, 2026"
export function eventLongDate(value) {
  const d = parseEventDate(value);
  if (!d) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// A time range string for the detail/list views: "4:00 PM – 8:00 PM" or "4:00 PM".
export function eventTimeRange(start, end, allDay) {
  if (allDay) return 'All day';
  const s = eventTime(start, false);
  const e = end ? eventTime(end, false) : '';
  if (s && e) return `${s} – ${e}`;
  return s || 'Time TBA';
}

// ---------- News expiry ----------
// A news row can carry an optional `expires_at`. Job-posting articles set it
// from the application deadline; any article can use it.
//
// IMPORTANT: the RLS policy on `news` is NOT enough on its own. The public
// pages read through the anon client *with cookies*, and the "staff write news"
// policy is FOR ALL — which includes SELECT — so a signed-in staff member's
// session makes expired rows visible again on the public pages. Every public
// read of `news` must therefore apply this filter explicitly, exactly the way
// /careers already guards `job_postings` with a deadline check.

/** PostgREST filter: keep only news that has not expired. */
export function onlyLiveNews(query) {
  return query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
}

/** In-memory equivalent, for rows already fetched. */
export function isNewsLive(row) {
  if (!row?.expires_at) return true;
  const t = new Date(row.expires_at);
  return isNaN(t) ? true : t > new Date();
}

// "May 20, 2026" for news
export function newsDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function newsSlugify(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
