# Meeting search (Fangorn Westmarch)

The Council Minutes page (`/government/minutes`) has a search bar over every item of business
in every meeting since 2024. Each result links to the page of the official PDF it is on.

It runs with no server and no API key: the index is a static Fangorn view in
`public/meeting-search`, and ranking happens in the visitor's own browser.

## How it works

```
piedmontcity.org/government/minutes ─► fangorn/sources/minutes.py ─► westmarch-ship --local ─► public/meeting-search
  (the public page, and each PDF)        meetings + items of business     embeds (nomic-embed-text-v1.5)   catalog, manifest,
                                         page number, PDF sha256          bakes the view                   sha256-checked shards
                                                                                                  │
                                    /government/minutes ◄── src/lib/meeting-search.js ◄───────────┘
                                    (people)                Westmarch's reader + search (src/lib/westmarch)
                                    WebMCP tools (agents in the same browser)
```

- **The source** (`fangorn/`) is Tony's Fangorn app from `driemworks/city-of-piedmont`: it reads
  the public minutes page, downloads each PDF, and splits it into one record per meeting and
  one per paragraph of business (resolution, ordinance, bills, purchase, appointment…), each
  with its PDF page and the PDF's sha256.
- **The index** is rebuilt by `.github/workflows/meeting-search.yml` every morning (6:17 AM
  Central), on demand (Actions → "Meeting search index" → Run workflow), and when anything in
  `fangorn/` changes. It commits only when records changed, so Vercel redeploys only then.
  New minutes uploaded in the admin show up in search by the next morning.
- **Quality gate:** `westmarch-eval` scores each build against `fangorn/eval/golden.jsonl`
  (Tony's questions: "knuckle boom truck", "Civic Center renovations", resolution counts…).
  The scores are in `public/meeting-search/build.json`. A build that loses more than a tenth
  of its meetings is not published.
- **If a build fails,** its log is committed to `fangorn/.ci/last-failure.txt` and the index
  already deployed stays up.

## In the browser

- Word matching answers immediately on every device.
- On desktop with a normal connection, the search model (about 140 MB, cached after the first
  time) loads in the background after the first search, and results are re-ranked by meaning.
  On phones it waits for a tap on "Search by meaning".
- `?q=` links open with the search run: `/government/minutes?q=knuckle%20boom%20truck`.
- In a browser with WebMCP, the page registers `describe_council_minutes`,
  `search_council_minutes`, `get_council_record` and `count_council_records`.
- The view is served with `Access-Control-Allow-Origin: *`, so `fangorn-mcp` and other
  readers can open `https://www.piedmontcity.org/meeting-search` directly.

## Files

| Path | What |
|---|---|
| `fangorn/` | The minutes source, app schema (`app.json`), eval questions and goals |
| `.github/workflows/meeting-search.yml` | Daily rebuild |
| `scripts/meeting-search-build-info.mjs` | Writes `build.json`; decides whether to publish |
| `public/meeting-search/` | The built view (generated; don't edit by hand) |
| `src/lib/westmarch/` | Westmarch 0.0.20-dev reader modules, vendored (MIT) |
| `src/lib/meeting-search.js` | Loading, search, highlighting, WebMCP tools |
| `src/app/government/minutes/MeetingSearch.jsx` | The search UI |

To build the view on a laptop: `cd fangorn && python -m venv .venv && .venv/bin/pip install -r sources/requirements.txt && npm ci && npm run site:crawl`.

The existing "Permanent Record" anchoring (`README-FANGORN.md`) is separate and unchanged; it
still runs on the SDK version in the root `package.json`.
