// Meeting search: the City Council minutes, searchable by meaning, in the reader's own browser.
//
// The index is a Fangorn/Westmarch view baked by .github/workflows/meeting-search.yml into
// public/meeting-search (catalog → manifest → sha256-checked shards). This module loads it
// with Westmarch's own reader (src/lib/westmarch) and ranks with Westmarch's `search`, so a
// person on the page and an agent driving it through WebMCP get the same answers.
// No server, no API key: the query never leaves the tab.

import { configure, loadShard } from '@/lib/westmarch/shard';
import { rolesFrom, textOf } from '@/lib/westmarch/roles';
import { search, matches, facet, getRow, describe } from '@/lib/westmarch/tools';
import { embedQuery, warmEmbedder } from '@/lib/westmarch/embed';

export const VIEW = '/meeting-search';
export const ITEM = 'piedmont.item.v1';
export const MEETING = 'piedmont.meeting.v1';

let roles = rolesFrom([]);
configure({
  onManifests: (ms) => { roles = rolesFrom(ms); },
  rowText: (f) => textOf(f, roles),
});

let indexPromise = null;

/** Every row of the view, split into items of business and whole meetings. Cached. */
export function loadMeetingIndex() {
  indexPromise ??= loadShard(VIEW).then((rows) => {
    const items = rows.filter((r) => r.entityType === ITEM);
    const meetings = rows.filter((r) => r.entityType === MEETING);
    return { rows, items, meetings, roles, byId: new Map(items.map((r) => [r.id, r])) };
  }).catch((e) => { indexPromise = null; throw e; });
  return indexPromise;
}

/** Counts and the last rebuild time, written beside the view by the workflow. */
export async function loadBuildInfo() {
  const res = await fetch(`${VIEW}/build.json`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

/**
 * Items of business that answer `query`, best first. `qv` (a query vector) makes it a
 * search by meaning with exact words as a tiebreak; without one it is a word search.
 * Returns the full rows, with Westmarch's score and mode.
 */
export function searchItems(index, query, { qv = null, kind = null, year = null, limit = 60 } = {}) {
  const where = { entityType: ITEM };
  if (kind) where.kind = kind;
  if (year) where.year = year;
  const hits = search(index.items, query, index.roles, { qv, where, limit });
  // Westmarch hands back a brief (title, tags, a clipped preview); the page wants the whole row.
  return hits.map((h) => ({ ...(index.byId.get(h.id) || h), score: h.score, mode: h.mode }));
}

/** How many items of each kind / year a query's results hold, for the filter chips. */
export function countBy(rows, field) {
  const out = new Map();
  for (const r of rows) out.set(r[field], (out.get(r[field]) || 0) + 1);
  return [...out].sort((a, b) => b[1] - a[1]);
}

export { embedQuery, warmEmbedder };

// ── words to highlight, and the passage to show ────────────────────────────────

const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'at', 'by', 'with', 'about',
  'what', 'when', 'who', 'did', 'does', 'was', 'were', 'is', 'are', 'how', 'much', 'many', 'city', 'council', 'put']);

export function queryTerms(query) {
  return [...new Set(String(query).toLowerCase().match(/[a-z0-9$][a-z0-9$.,'-]*/g) || [])]
    .map((t) => t.replace(/[.,'-]+$/, ''))
    .filter((t) => t.length > 1 && !STOP.has(t));
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A window of `text` around the first query term (or its opening), split into
 *  [{ text, hit }] pieces for <mark>. */
export function snippet(text, terms, size = 260) {
  const t = String(text || '');
  if (!t) return [];
  const re = terms.length ? new RegExp(`\\b(${terms.map(escapeRe).join('|')})`, 'gi') : null;
  let start = 0;
  if (re) {
    const m = re.exec(t);
    if (m && m.index > size * 0.35) start = t.lastIndexOf(' ', m.index - Math.round(size * 0.3)) + 1;
    re.lastIndex = 0;
  }
  let end = Math.min(t.length, start + size);
  if (end < t.length) end = t.lastIndexOf(' ', end) > start ? t.lastIndexOf(' ', end) : end;
  const body = t.slice(start, end);
  return highlight(`${start > 0 ? '… ' : ''}${body}${end < t.length ? ' …' : ''}`, terms);
}

export function highlight(text, terms) {
  const s = String(text || '');
  if (!terms.length) return [{ text: s, hit: false }];
  const re = new RegExp(`\\b(${terms.map(escapeRe).join('|')})`, 'gi');
  const out = [];
  let at = 0;
  for (let m; (m = re.exec(s));) {
    if (m.index > at) out.push({ text: s.slice(at, m.index), hit: false });
    out.push({ text: m[0], hit: true });
    at = m.index + m[0].length;
  }
  if (at < s.length) out.push({ text: s.slice(at), hit: false });
  return out;
}

// ── WebMCP: the same search, for an agent in the reader's browser ─────────────────

const ok = (o) => ({ content: [{ type: 'text', text: JSON.stringify(o) }] });
const obj = (properties, required = []) => ({ type: 'object', properties, required });

/**
 * Register this page's tools with the browser's model context (WebMCP), if it has one.
 * The same verbs as fangorn-mcp's data tools, over the rows this page loaded.
 * Returns an unregister function.
 */
export function registerMeetingTools(index) {
  const mc = (typeof navigator !== 'undefined' && navigator.modelContext)
    || (typeof document !== 'undefined' && document.modelContext);
  if (!mc?.registerTool) return () => {};
  const qv = (q) => embedQuery(q).catch(() => null);
  const tools = [
    {
      name: 'describe_council_minutes',
      description: 'What the Piedmont, Alabama City Council minutes index holds: every meeting since 2024 and each item of business in it (resolutions, ordinances, bills, contracts, purchases, appointments, reports), with the official PDF page and its sha256. Call it first.',
      inputSchema: obj({}),
      execute: async () => ok({ ...describe(index.rows), meetings: index.meetings.length, items: index.items.length,
        kinds: facet(index.items, 'kind', { limit: 30 }), years: facet(index.items, 'year') }),
    },
    {
      name: 'search_council_minutes',
      description: 'Search the City Council minutes by meaning: a question in plain words ("the knuckle boom truck", "who was appointed to the zoning board"). Optional equality filters in `where`, e.g. {"kind":"resolution","year":"2025"}. Each hit links to the page of the official PDF it is on.',
      inputSchema: obj({ query: { type: 'string' }, limit: { type: 'number' }, where: { type: 'object' } }, ['query']),
      execute: async ({ query, limit = 10, where }) =>
        ok(search(index.rows, query, index.roles, { qv: await qv(query), limit, where: { entityType: ITEM, ...(where || {}) },
          fields: ['kind', 'date', 'meeting', 'page', 'url', 'pdf_sha256'] })),
    },
    {
      name: 'get_council_record',
      description: 'One item of business or meeting in full, by the id search returns: the minutes text, the PDF link and page, and the PDF sha256.',
      inputSchema: obj({ id: { type: 'string' } }, ['id']),
      execute: async ({ id }) => {
        const row = index.rows.find((r) => r.id === id || r.item_id === id || r.meeting_id === id);
        if (!row) return ok({ error: `no record ${id}` });
        const { vector, norm, ...fields } = row;
        return ok(fields);
      },
    },
    {
      name: 'count_council_records',
      description: 'Count the distinct values of a field (kind, year, meeting_type, date) across items of business, optionally filtered by `where`: how many resolutions in 2025, which meetings had the most business.',
      inputSchema: obj({ field: { type: 'string' }, where: { type: 'object' }, limit: { type: 'number' } }, ['field']),
      execute: async ({ field, where, limit = 20 }) =>
        ok(facet(index.items.filter((r) => matches(r, where)), field, { limit })),
    },
  ];
  const handles = [];
  for (const t of tools) {
    try { handles.push(mc.registerTool(t)); } catch { /* a host that refuses one tool should not lose the rest */ }
  }
  return () => {
    for (const h of handles) { try { h?.unregister?.(); } catch { /* already gone */ } }
    for (const t of tools) { try { mc.unregisterTool?.(t.name); } catch { /* not supported */ } }
  };
}

export { getRow };
