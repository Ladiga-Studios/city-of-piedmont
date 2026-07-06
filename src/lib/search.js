// Core search logic, shared by the API route and any client filtering.
// Matches a query against indexed entries with light relevance scoring:
//   - exact title match scores highest
//   - title starts-with / contains next
//   - keyword/summary contains lowest
// Multi-word queries: an entry must match ALL words (AND), and its score is the
// sum of per-word scores.

import { STATIC_INDEX } from './search-index';
import { DEPARTMENTS } from './departments';

// Turn the departments data into searchable index entries.
export function departmentEntries() {
  return DEPARTMENTS.map((d) => {
    const staff = (d.staff || []).map((s) => `${s.name} ${s.role || ''}`).join(' ');
    const services = (d.services || []).join(' ');
    const offices = (d.offices || []).map((o) => o.name).join(' ');
    return {
      title: d.name,
      href: `/departments/${d.slug}`,
      type: 'Department',
      summary: d.short || d.intro || '',
      keywords: `${d.name} department ${services} ${staff} ${offices} ${d.short || ''}`,
    };
  });
}

// All static, non-database entries (pages + parks + departments).
export function staticEntries() {
  return [...STATIC_INDEX, ...departmentEntries()];
}

function norm(s) {
  return (s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

// Score a single entry against the (already-lowercased) query words.
// Returns 0 if the entry doesn't match every word.
function scoreEntry(entry, words, rawQuery) {
  const title = norm(entry.title);
  const hay = `${title} ${norm(entry.summary)} ${norm(entry.keywords)}`;

  // Whole-query exact title match is a strong signal.
  let score = 0;
  if (title === rawQuery) score += 100;
  else if (title.startsWith(rawQuery)) score += 40;

  for (const w of words) {
    if (!hay.includes(w)) return 0; // AND: every word must appear somewhere
    if (title === w) score += 30;
    else if (title.startsWith(w)) score += 18;
    else if (title.includes(w)) score += 12;
    else score += 4; // matched only in summary/keywords
  }
  return score;
}

/**
 * Search an array of index entries.
 * @param {Array} entries  index entries ({ title, href, type, summary, keywords })
 * @param {string} query   user query
 * @param {number} limit   max results
 */
export function searchEntries(entries, query, limit = 50) {
  const rawQuery = norm(query).trim();
  if (!rawQuery) return [];
  const words = rawQuery.split(/\s+/).filter(Boolean);

  return entries
    .map((e) => ({ entry: e, score: scoreEntry(e, words, rawQuery) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.entry);
}

// Order in which result groups appear on the results page.
export const TYPE_ORDER = ['Page', 'Department', 'Park', 'News', 'Event', 'Business'];
