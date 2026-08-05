// ============================================================
// Permanent Record anchoring — Fangorn integration (SERVER ONLY)
//
// Anchors a SHA-256 fingerprint + metadata for each published
// record (minutes, notices, news) into the city's Fangorn
// metagraph, whose root settles on-chain. This makes the public
// record tamper-evident: anyone can re-hash a posted PDF and
// check it against the anchored fingerprint.
//
// Design rules (do not break these):
//  1. HASH ONLY — document bytes are never uploaded to IPFS.
//     Only the fingerprint + public metadata leave the city's
//     own storage. (Accidentally-posted private info in a PDF
//     can still be pulled from Supabase; the anchor only proves
//     a file with that hash existed.)
//  2. NEVER BLOCKING — if anchoring fails or isn't configured,
//     uploads still succeed. Rows stay 'pending'/'failed' and
//     `npm run anchor` (scripts/anchor-records.mjs) retries.
//  3. ENV-GATED — with no FANGORN_* env vars the site behaves
//     exactly as before. See .env.local.example.
//
// The SDK is imported lazily so the site builds and runs even
// if the package or credentials are absent.
// ============================================================

import { createHash } from 'node:crypto';

// One namespace per record class in the city's publisher root.
export const NAMESPACES = {
  minutes: 'minutes',
  notices: 'notices',
  news: 'news',
};

/** SHA-256 hex of a Buffer/Uint8Array/string. */
export function sha256Of(data) {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Canonical fingerprint for a news item: hash the published
 * fields in a fixed order so the same content always yields the
 * same hash regardless of DB row ordering.
 */
export function newsSha256({ title, body, content, published_at }) {
  const canonical = JSON.stringify({
    title: title || '',
    body: body || '',
    content: content || '',
    published_at: published_at || '',
  });
  return sha256Of(canonical);
}

/** True when the server has everything it needs to anchor. */
export function anchoringEnabled() {
  return Boolean(
    process.env.FANGORN_PRIVATE_KEY &&
    process.env.FANGORN_PINATA_JWT &&
    process.env.FANGORN_PINATA_GATEWAY
  );
}

// Lazy singleton — created on first anchor, reused after.
let _client = null;
async function getClient() {
  if (_client) return _client;
  const { Fangorn } = await import('@fangorn-network/sdk');
  _client = Fangorn.create({
    privateKey: process.env.FANGORN_PRIVATE_KEY,
    appId: process.env.FANGORN_APP_ID || 'piedmont-al',
    storage: {
      pinata: {
        jwt: process.env.FANGORN_PINATA_JWT,
        gateway: process.env.FANGORN_PINATA_GATEWAY,
      },
    },
  });
  return _client;
}

/**
 * Anchor one or more records into a namespace as a single commit
 * (one CAR upload + one on-chain settlement for the whole batch).
 *
 * @param {'minutes'|'notices'|'news'} kind
 * @param {Array<{id: string, payload: object}>} records
 *   `id` is the Supabase row id (stable vertex id); `payload` is
 *   the public metadata to anchor — MUST already include sha256.
 * @returns {Promise<{commitCid: string, txHash: string, vertexCids: Record<string,string>}>}
 */
export async function anchorBatch(kind, records) {
  if (!anchoringEnabled()) throw new Error('Anchoring is not configured (missing FANGORN_* env vars).');
  if (!records?.length) throw new Error('No records to anchor.');

  const namespace = NAMESPACES[kind];
  if (!namespace) throw new Error(`Unknown record kind: ${kind}`);

  const client = await getClient();

  // No-op if the namespace already exists, so safe to call every time.
  await client.initRepo(namespace);

  const vertices = records.map((r) => ({
    id: r.id,
    tag: `piedmont-${kind}`,
    payload: r.payload,
  }));

  return client.uploadBatch(namespace, vertices);
}

/**
 * Fire-and-report wrapper used by the admin upload routes.
 * Anchors a single record and writes the result back to its row.
 * NEVER throws — returns { anchored, error } so callers can pass
 * a warning to the admin UI without failing the upload.
 *
 * @param {object} supabase  server-side Supabase client (staff session)
 * @param {string} table     'minutes' | 'public_notices' | 'news'
 * @param {'minutes'|'notices'|'news'} kind
 * @param {object} row       the inserted/updated DB row (must have .id)
 * @param {object} payload   metadata to anchor (must include sha256)
 */
export async function tryAnchorRecord(supabase, table, kind, row, payload) {
  if (!anchoringEnabled()) {
    return { anchored: false, error: null }; // silently off — row stays 'pending'
  }
  try {
    const { commitCid, txHash, vertexCids } = await anchorBatch(kind, [
      { id: row.id, payload },
    ]);
    const fields = {
      anchor_status: 'anchored',
      anchor_commit_cid: commitCid,
      anchor_vertex_cid: vertexCids?.[row.id] || null,
      anchor_tx: txHash,
      anchored_at: new Date().toISOString(),
      anchor_error: null,
    };
    const { error } = await supabase.from(table).update(fields).eq('id', row.id);
    if (error) throw new Error(`Anchored on-chain but DB update failed: ${error.message}`);
    return { anchored: true, error: null, ...fields };
  } catch (err) {
    const message = err?.message || 'Unknown anchoring error';
    // Best-effort: record the failure so the sweep can retry it.
    try {
      await supabase.from(table)
        .update({ anchor_status: 'failed', anchor_error: message.slice(0, 500) })
        .eq('id', row.id);
    } catch { /* leave as pending */ }
    return { anchored: false, error: message };
  }
}

/**
 * Public metadata payload builders — everything here is already
 * public on the website; the anchor adds no new information,
 * only proof of what was published and when.
 */
export function minutesPayload(m) {
  return {
    kind: 'council-minutes',
    publisher: 'City of Piedmont, Alabama',
    title: m.title,
    meeting_date: m.meeting_date,
    file_url: m.file_url,
    sha256: m.sha256,
    algo: 'sha256',
    posted_at: m.created_at || new Date().toISOString(),
  };
}

export function noticePayload(n) {
  return {
    kind: n.category === 'bid' ? 'bid-request' : 'public-notice',
    publisher: 'City of Piedmont, Alabama',
    title: n.title,
    posted_date: n.posted_date,
    closes_date: n.closes_date || null,
    file_url: n.file_url,
    sha256: n.sha256,
    algo: 'sha256',
    posted_at: n.created_at || new Date().toISOString(),
  };
}

export function newsPayload(n) {
  return {
    kind: 'city-news',
    publisher: 'City of Piedmont, Alabama',
    title: n.title,
    slug: n.slug,
    published_at: n.published_at,
    sha256: n.sha256,
    algo: 'sha256',
    // Silent-edit protection: each revision names the fingerprint
    // it replaced, so the version chain is explicit.
    supersedes_sha256: n.prev_sha256 || null,
  };
}
