// Shared helpers for the Public Notices & Bid Requests feature.
// Used by the public page (/government/notices), the admin console
// (/admin/notices), and anywhere else a notice is displayed.

export const NOTICE_CATEGORIES = [
  { value: 'notice', label: 'Public Notice' },
  { value: 'bid', label: 'Bid Request' },
];

export function categoryLabel(value) {
  return NOTICE_CATEGORIES.find((c) => c.value === value)?.label || 'Public Notice';
}

// "2025-04-15" -> "April 15, 2025"
export function fmtNoticeDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

// True if a bid's closing date is in the past (so we can mark it closed).
export function isBidClosed(closesDate) {
  if (!closesDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(closesDate + 'T00:00:00') < today;
}
