#!/usr/bin/env node
/**
 * backfill-summaries.mjs
 * ------------------------------------------------------------------
 * Generates AI summaries for council minutes that don't have one yet
 * (your 59 migrated records). Run once after adding the summary columns.
 *
 * For each minutes row with summary_status = 'pending':
 *   1. Downloads its PDF from your Supabase 'minutes' bucket.
 *   2. Sends it to Claude for a structured summary.
 *   3. Writes summary / decisions / action_items back to the row.
 *
 * ------------------------------------------------------------------
 * SETUP (run from project root):
 *
 *   1. First run supabase-add-summaries.sql in the Supabase SQL editor
 *      (adds the summary columns).
 *
 *   2. Make sure .env.local has:
 *        NEXT_PUBLIC_SUPABASE_URL=...
 *        SUPABASE_SERVICE_ROLE_KEY=...
 *        ANTHROPIC_API_KEY=...            <-- your Anthropic key
 *
 *   3. npm install @supabase/supabase-js   (already installed from migration)
 *
 *   4. Run:
 *        node scripts/backfill-summaries.mjs
 *
 *      Test a single one first:
 *        node scripts/backfill-summaries.mjs --limit 1
 *
 * Safe to re-run: only touches rows still marked 'pending' (or 'failed'
 * if you pass --retry-failed). Successful rows are skipped.
 * ------------------------------------------------------------------
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { summarizeMinutesPdf } from '../src/lib/summarize.js';

// ---- load .env.local ----------------------------------------------
function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {}
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || !ANTHROPIC_KEY) {
  console.error(
    '\n  Missing env. Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and ANTHROPIC_API_KEY in .env.local.\n'
  );
  process.exit(1);
}

// ---- args ----------------------------------------------------------
const args = process.argv.slice(2);
const limitArg = args.indexOf('--limit');
const LIMIT = limitArg !== -1 ? parseInt(args[limitArg + 1], 10) : Infinity;
const RETRY_FAILED = args.includes('--retry-failed');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function main() {
  const statuses = RETRY_FAILED ? ['pending', 'failed'] : ['pending'];
  const { data: rows, error } = await supabase
    .from('minutes')
    .select('*')
    .in('summary_status', statuses)
    .order('meeting_date', { ascending: false });

  if (error) {
    console.error('Could not load minutes:', error.message);
    process.exit(1);
  }

  const todo = rows.slice(0, LIMIT);
  console.log(`\n${rows.length} minutes need summaries; processing ${todo.length}.\n`);

  let ok = 0, failed = 0;

  for (const m of todo) {
    process.stdout.write(`  ${m.meeting_date}  ${m.title} ... `);
    try {
      // Download the PDF from storage.
      const { data: blob, error: dlErr } = await supabase.storage
        .from('minutes')
        .download(m.file_path);
      if (dlErr) throw new Error(`download: ${dlErr.message}`);
      const buf = Buffer.from(await blob.arrayBuffer());

      // Summarize.
      const result = await summarizeMinutesPdf(
        buf,
        { title: m.title, meeting_date: m.meeting_date },
        ANTHROPIC_KEY
      );

      // Save back.
      const { error: upErr } = await supabase
        .from('minutes')
        .update({
          summary: result.summary,
          decisions: result.decisions,
          action_items: result.action_items,
          summary_status: 'ready',
        })
        .eq('id', m.id);
      if (upErr) throw new Error(`update: ${upErr.message}`);

      console.log('done');
      ok++;
    } catch (err) {
      console.log('FAILED — ' + (err.message || err));
      await supabase.from('minutes').update({ summary_status: 'failed' }).eq('id', m.id);
      failed++;
    }
  }

  console.log(`\nFinished. Summarized ${ok}, failed ${failed}.`);
  if (failed) console.log('Re-run with --retry-failed to try the failed ones again.');
}

main().catch((e) => {
  console.error('\nAborted:', e.message || e);
  process.exit(1);
});
