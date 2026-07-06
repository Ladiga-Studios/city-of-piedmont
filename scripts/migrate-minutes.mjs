#!/usr/bin/env node
/**
 * migrate-minutes.mjs
 * ------------------------------------------------------------------
 * One-time migration of the City of Piedmont's existing council
 * meeting minutes off the old website and into YOUR Supabase project.
 *
 * What it does:
 *   1. Fetches the live council-minutes page.
 *   2. Parses every minutes entry (title + date + PDF link).
 *   3. Downloads each PDF.
 *   4. Uploads each PDF to your Supabase Storage bucket ("minutes").
 *   5. Inserts a matching row into the public.minutes table.
 *
 * After it finishes, every download link on your new site points at
 * YOUR Supabase storage, so the old city site can go away safely.
 *
 * ------------------------------------------------------------------
 * SETUP (run from the project root):
 *
 *   1. Make sure your .env.local has these three values filled in:
 *        NEXT_PUBLIC_SUPABASE_URL=...
 *        SUPABASE_SERVICE_ROLE_KEY=...      <-- service role, NOT anon
 *      (The service role key bypasses row-level security so the
 *       script can write. Find it in Supabase > Project Settings >
 *       API > service_role. Keep it secret; never ship it to the browser.)
 *
 *   2. Install the two deps this script needs:
 *        npm install @supabase/supabase-js node-html-parser
 *
 *   3. Run it:
 *        node scripts/migrate-minutes.mjs
 *
 *      Dry run first (parses + lists what it WOULD import, downloads
 *      nothing, writes nothing):
 *        node scripts/migrate-minutes.mjs --dry-run
 *
 * It is safe to re-run: it skips any PDF whose storage path already
 * exists, so a half-finished run can just be run again.
 * ------------------------------------------------------------------
 */

import { createClient } from '@supabase/supabase-js';
import { parse } from 'node-html-parser';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ---- config -------------------------------------------------------
const SOURCE_URL =
  'https://www.piedmontcity.org/city-government/council-meeting-minutes/';
const BUCKET = 'minutes';
const DRY_RUN = process.argv.includes('--dry-run');

// ---- load env from .env.local (no extra dep) ----------------------
function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    /* .env.local optional if vars already in environment */
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DRY_RUN && (!SUPABASE_URL || !SERVICE_KEY)) {
  console.error(
    '\n  Missing Supabase credentials.\n' +
      '  Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.\n' +
      '  (Use --dry-run to test parsing without them.)\n'
  );
  process.exit(1);
}

// ---- date parsing -------------------------------------------------
const MONTHS = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
};

/** Pull "Month D, YYYY" out of a label like "MINUTES JANUARY 6, 2026". */
function extractDate(text) {
  const m = text.match(
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/i
  );
  if (!m) return null;
  const month = MONTHS[m[1].toLowerCase()];
  const day = String(m[2]).padStart(2, '0');
  const year = m[3];
  return `${year}-${month}-${day}`; // ISO date for the DB
}

/** Build a clean title from the link text. */
function cleanTitle(text) {
  return text
    .replace(/\(opens in new window\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---- scrape -------------------------------------------------------
async function scrape() {
  console.log(`Fetching ${SOURCE_URL} ...`);
  const res = await fetch(SOURCE_URL, {
    headers: { 'User-Agent': 'PiedmontMinutesMigration/1.0' },
  });
  if (!res.ok) throw new Error(`Source page returned ${res.status}`);
  const html = await res.text();
  const root = parse(html);

  // Every minutes entry is a link to a PDF. Grab all <a> with .pdf hrefs.
  const anchors = root.querySelectorAll('a[href]');
  const seen = new Set();
  const entries = [];

  for (const a of anchors) {
    let href = a.getAttribute('href') || '';
    if (!/\.pdf(\?|$)/i.test(href)) continue;

    // Resolve relative URLs against the source.
    const url = new URL(href, SOURCE_URL).toString();
    if (seen.has(url)) continue;

    const rawText = a.text || '';
    const date = extractDate(rawText) || extractDate(url);
    if (!date) {
      console.warn(`  ! Skipping (no date found): "${cleanTitle(rawText)}" -> ${url}`);
      continue;
    }

    seen.add(url);
    entries.push({ title: cleanTitle(rawText) || `Minutes ${date}`, date, url });
  }

  // Newest first.
  entries.sort((a, b) => (a.date < b.date ? 1 : -1));
  return entries;
}

// ---- migrate ------------------------------------------------------
async function main() {
  const entries = await scrape();
  console.log(`\nFound ${entries.length} minutes entries.\n`);

  if (DRY_RUN) {
    for (const e of entries) console.log(`  ${e.date}  ${e.title}\n            ${e.url}`);
    console.log(`\n[dry run] Nothing downloaded or written. Re-run without --dry-run to import.`);
    return;
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  let ok = 0, skipped = 0, failed = 0;

  for (const e of entries) {
    const safeName = e.url.split('/').pop().split('?')[0].replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${e.date}-${safeName}`;

    try {
      // Skip if this PDF is already uploaded (lets you safely re-run).
      const { data: existing } = await supabase
        .from('minutes')
        .select('id')
        .eq('file_path', path)
        .maybeSingle();
      if (existing) {
        console.log(`  = already imported: ${e.title}`);
        skipped++;
        continue;
      }

      // Download the PDF.
      const pdfRes = await fetch(e.url, {
        headers: { 'User-Agent': 'PiedmontMinutesMigration/1.0' },
      });
      if (!pdfRes.ok) throw new Error(`download ${pdfRes.status}`);
      const buf = Buffer.from(await pdfRes.arrayBuffer());

      // Upload to Storage.
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, buf, { contentType: 'application/pdf', upsert: true });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

      // Insert DB row.
      const { error: insErr } = await supabase.from('minutes').insert({
        title: e.title,
        meeting_date: e.date,
        file_url: pub.publicUrl,
        file_path: path,
      });
      if (insErr) throw insErr;

      console.log(`  + imported: ${e.date}  ${e.title}`);
      ok++;
    } catch (err) {
      console.error(`  x FAILED: ${e.title} (${e.url}) — ${err.message || err}`);
      failed++;
    }
  }

  console.log(`\nDone. Imported ${ok}, skipped ${skipped}, failed ${failed}.`);
  if (failed) console.log('Re-run the script to retry the failed ones (successful ones are skipped).');
}

main().catch((err) => {
  console.error('\nMigration aborted:', err.message || err);
  process.exit(1);
});
