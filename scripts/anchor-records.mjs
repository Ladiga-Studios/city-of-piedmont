#!/usr/bin/env node
// ============================================================
// scripts/anchor-records.mjs — Permanent Record sweep
//
// Anchors every published record (minutes, notices, news) whose
// anchor_status is 'pending' or 'failed'. Run it:
//   - once after setup, to backfill the existing archive
//   - on a schedule (e.g. nightly cron), as the safety net for
//     records the live upload routes couldn't anchor
//
// Usage:
//   npm run anchor              anchor everything pending/failed
//   npm run anchor -- --dry     show what would be anchored
//   npm run anchor -- --status  counts per table, no writes
//
// Requires in .env.local:
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
//   FANGORN_PRIVATE_KEY, FANGORN_PINATA_JWT, FANGORN_PINATA_GATEWAY
//
// One-time on-chain setup (see README-FANGORN.md):
//   npx fangorn init        (or set the env vars above)
//   npx fangorn register    (registers the city wallet as publisher)
//
// Each table is anchored as ONE batch = one CAR upload + one
// settlement transaction, so a full backfill costs at most three
// transactions.
// ============================================================

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// ---------- tiny .env.local loader (no extra dependency) ----------
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try {
  const env = readFileSync(resolve(rootDir, '.env.local'), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
} catch { /* .env.local optional if vars are set in the shell */ }

const DRY = process.argv.includes('--dry');
const STATUS_ONLY = process.argv.includes('--status');

const {
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY,
  FANGORN_PRIVATE_KEY, FANGORN_PINATA_JWT, FANGORN_PINATA_GATEWAY,
} = process.env;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const sha256Of = (data) => createHash('sha256').update(data).digest('hex');

// ---------- what to anchor, per table ----------
// payload builders mirror src/lib/fangorn-anchor.js (kept inline so
// this script runs standalone without Next's import aliases).
const TABLES = [
  {
    table: 'minutes', kind: 'minutes', namespace: 'minutes', isPdf: true,
    payload: (m) => ({
      kind: 'council-minutes', publisher: 'City of Piedmont, Alabama',
      title: m.title, meeting_date: m.meeting_date, file_url: m.file_url,
      sha256: m.sha256, algo: 'sha256', posted_at: m.created_at,
    }),
  },
  {
    table: 'public_notices', kind: 'notices', namespace: 'notices', isPdf: true,
    payload: (n) => ({
      kind: n.category === 'bid' ? 'bid-request' : 'public-notice',
      publisher: 'City of Piedmont, Alabama',
      title: n.title, posted_date: n.posted_date, closes_date: n.closes_date || null,
      file_url: n.file_url, sha256: n.sha256, algo: 'sha256', posted_at: n.created_at,
    }),
  },
  {
    table: 'news', kind: 'news', namespace: 'news', isPdf: false,
    payload: (n) => ({
      kind: 'city-news', publisher: 'City of Piedmont, Alabama',
      title: n.title, slug: n.slug, published_at: n.published_at,
      sha256: n.sha256, algo: 'sha256', supersedes_sha256: n.prev_sha256 || null,
    }),
  },
];

// ---------- status report ----------
async function report() {
  for (const t of TABLES) {
    const { data } = await supabase.from(t.table).select('anchor_status');
    const counts = {};
    for (const r of data || []) counts[r.anchor_status || 'pending'] = (counts[r.anchor_status || 'pending'] || 0) + 1;
    console.log(`${t.table}: ${JSON.stringify(counts)}`);
  }
}

// ---------- backfill a missing fingerprint ----------
// Older rows (uploaded before this feature) have no sha256 yet.
// For PDFs we download the published file and hash the bytes; for
// news we hash the canonical fields.
async function ensureSha256(t, row) {
  if (row.sha256) return row.sha256;
  if (t.isPdf) {
    const res = await fetch(row.file_url);
    if (!res.ok) throw new Error(`Could not fetch ${row.file_url}: HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return sha256Of(buf);
  }
  return sha256Of(JSON.stringify({
    title: row.title || '', body: row.body || '',
    content: row.content || '', published_at: row.published_at || '',
  }));
}

// ---------- main ----------
async function main() {
  if (STATUS_ONLY) return report();

  if (!FANGORN_PRIVATE_KEY || !FANGORN_PINATA_JWT || !FANGORN_PINATA_GATEWAY) {
    console.error('Anchoring is not configured. Add FANGORN_PRIVATE_KEY, FANGORN_PINATA_JWT,');
    console.error('and FANGORN_PINATA_GATEWAY to .env.local (see README-FANGORN.md).');
    process.exit(1);
  }

  const { Fangorn } = await import('@fangorn-network/sdk');
  const fangorn = Fangorn.create({
    privateKey: FANGORN_PRIVATE_KEY,
    appId: process.env.FANGORN_APP_ID || 'piedmont-al',
    storage: { pinata: { jwt: FANGORN_PINATA_JWT, gateway: FANGORN_PINATA_GATEWAY } },
  });

  let totalAnchored = 0;

  for (const t of TABLES) {
    const { data: rows, error } = await supabase
      .from(t.table)
      .select('*')
      .in('anchor_status', ['pending', 'failed'])
      .order('created_at', { ascending: true });

    if (error) { console.error(`${t.table}: query failed — ${error.message}`); continue; }
    if (!rows?.length) { console.log(`${t.table}: nothing to anchor.`); continue; }

    // Fill in missing fingerprints first (and persist them, so the
    // hash is on record even if the on-chain step fails).
    const ready = [];
    for (const row of rows) {
      try {
        const sha = await ensureSha256(t, row);
        if (!row.sha256) {
          row.sha256 = sha;
          if (!DRY) await supabase.from(t.table).update({ sha256: sha }).eq('id', row.id);
        }
        ready.push(row);
      } catch (err) {
        console.error(`${t.table} ${row.id}: fingerprint failed — ${err.message}`);
        if (!DRY) {
          await supabase.from(t.table)
            .update({ anchor_status: 'failed', anchor_error: `fingerprint: ${err.message}`.slice(0, 500) })
            .eq('id', row.id);
        }
      }
    }

    if (!ready.length) continue;
    console.log(`${t.table}: anchoring ${ready.length} record(s) as one batch…`);
    if (DRY) { ready.forEach((r) => console.log(`  [dry] ${r.id}  ${r.title}`)); continue; }

    try {
      // No-op if the namespace already exists.
      await fangorn.initRepo(t.namespace);

      const vertices = ready.map((r) => ({ id: r.id, tag: `piedmont-${t.kind}`, payload: t.payload(r) }));
      const { commitCid, txHash, vertexCids } = await fangorn.uploadBatch(t.namespace, vertices);

      const anchoredAt = new Date().toISOString();
      for (const r of ready) {
        await supabase.from(t.table).update({
          anchor_status: 'anchored',
          anchor_commit_cid: commitCid,
          anchor_vertex_cid: vertexCids?.[r.id] || null,
          anchor_tx: txHash,
          anchored_at: anchoredAt,
          anchor_error: null,
        }).eq('id', r.id);
      }
      totalAnchored += ready.length;
      console.log(`${t.table}: anchored ${ready.length} — commit ${commitCid}`);
      console.log(`  tx: https://sepolia.arbiscan.io/tx/${txHash}`);
    } catch (err) {
      const msg = err?.message || String(err);
      console.error(`${t.table}: batch failed — ${msg}`);
      if (/not registered|register/i.test(msg)) {
        console.error('  ➜ The city wallet may not be registered as a publisher yet.');
        console.error('    Run:  npx fangorn init   then   npx fangorn register');
      }
      for (const r of ready) {
        await supabase.from(t.table)
          .update({ anchor_status: 'failed', anchor_error: msg.slice(0, 500) })
          .eq('id', r.id);
      }
    }
  }

  console.log(DRY ? 'Dry run complete.' : `Done. ${totalAnchored} record(s) anchored.`);
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
