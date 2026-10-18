// Meeting search: after westmarch-ship --local has baked public/meeting-search, write
// build.json beside it (what the minutes page shows: counts and the update date) and decide
// whether this run is worth a commit.
//
//   node scripts/meeting-search-build-info.mjs <view dir> [eval report.json] [eval outcome]
//
// Publishes only when the records changed (the catalog's timestamps change every run, so a
// fingerprint over the shards' own sha256s decides). Refuses to publish an index that lost
// more than a tenth of its meetings: that is a crawl that failed part-way, not a council that
// unheld its meetings, and the index already deployed is the better one to keep.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';

const [viewArg, evalPath, evalOutcome = 'skipped'] = process.argv.slice(2);
const view = resolve(viewArg || 'public/meeting-search');
const out = (k, v) => process.env.GITHUB_OUTPUT && appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`);
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

const domainsDir = join(view, 'cdn/domains');
const manifests = readdirSync(domainsDir).map((d) => ({ dir: join(domainsDir, d), m: readJson(join(domainsDir, d, 'manifest')) }));

let meetings = 0, items = 0, latest = '';
const kinds = {}, years = {};
const shardHashes = [];
for (const { dir, m } of manifests) {
  for (const s of m.shards || []) {
    shardHashes.push(s.sha256);
    const text = gunzipSync(readFileSync(join(dir, 'shards', s.file))).toString('utf8');
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      const f = JSON.parse(line).fields || {};
      if (f.entityType === 'piedmont.meeting.v1') {
        meetings++;
        if (f.date > latest) latest = f.date;
      } else if (f.entityType === 'piedmont.item.v1') {
        items++;
        kinds[f.kind] = (kinds[f.kind] || 0) + 1;
        years[f.year] = (years[f.year] || 0) + 1;
      }
    }
  }
}
const fingerprint = createHash('sha256').update(shardHashes.sort().join('\n')).digest('hex');

let previous = null;
try {
  previous = JSON.parse(execFileSync('git', ['show', 'HEAD:public/meeting-search/build.json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
} catch { /* first build */ }

let evalSummary = { outcome: evalOutcome };
if (evalPath && existsSync(evalPath)) {
  const r = readJson(evalPath);
  evalSummary = { outcome: evalOutcome, pass: r.pass, goals: r.goals, failures: r.failures };
}

const westmarch = (() => { try { return readJson(resolve('node_modules/@fangorn-network/westmarch/package.json')).version; } catch { return null; } })();
const summary = `${meetings} meetings, ${items} items, latest ${latest || 'none'}`;
console.log(`meeting search: ${summary}; fingerprint ${fingerprint.slice(0, 12)}…${previous ? ` (was ${previous.fingerprint?.slice(0, 12)}…, ${previous.meetings} meetings)` : ' (first build)'}`);

if (!meetings || !items) {
  console.error('meeting search: the view holds no meetings or no items; keeping the deployed index');
  process.exit(1);
}
if (previous?.meetings && meetings < previous.meetings * 0.9) {
  console.error(`meeting search: ${meetings} meetings is well under the ${previous.meetings} already published; keeping the deployed index`);
  process.exit(1);
}

if (previous?.fingerprint === fingerprint) {
  console.log('meeting search: no record changed; nothing to publish');
  execFileSync('git', ['checkout', '--', 'public/meeting-search'], { cwd: resolve(view, '../..'), stdio: 'inherit' });
  execFileSync('git', ['clean', '-fdq', 'public/meeting-search'], { cwd: resolve(view, '../..'), stdio: 'inherit' });
  out('publish', 'false');
  out('summary', summary);
  process.exit(0);
}

writeFileSync(join(view, 'build.json'), JSON.stringify({
  generated_at: new Date().toISOString(),
  meetings, items, latest_meeting: latest || null,
  kinds, years,
  fingerprint,
  model: 'nomic-ai/nomic-embed-text-v1.5',
  westmarch,
  eval: evalSummary,
}, null, 1) + '\n');
out('publish', 'true');
out('summary', summary);
