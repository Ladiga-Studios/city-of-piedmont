# Permanent Record (Fangorn) — Setup & Operations

Tamper-evident anchoring for the city's published records. When staff post
council minutes, a public notice, or a news item, the site computes the
document's SHA-256 fingerprint and files it — with public metadata — in the
city's [Fangorn](https://github.com/fangorn-network/fangorn) metagraph, whose
state root settles on-chain. Anyone can later re-hash a posted PDF and prove
it matches (or doesn't match) what the city filed.

**Design decisions (deliberate — don't change casually):**

- **Hash-only.** Document bytes are never uploaded to IPFS. Only the
  fingerprint + already-public metadata (title, date, URL) are anchored. If a
  PDF with private info is ever posted by mistake, it can still be pulled from
  Supabase; the anchor only proves a file with that hash existed.
- **Never blocking.** Anchoring failures never fail an upload. Rows are marked
  `pending`/`failed` and `npm run anchor` retries them.
- **Env-gated.** With no `FANGORN_*` vars set, the site behaves exactly as
  before. The public badge only renders on records that are actually anchored.
- **Edits are versions, not erasures.** News edits produce a new fingerprint
  anchored with a `supersedes_sha256` pointer to the old one. Minutes and
  notices are treated as immutable once posted.

## What was added

| File | Purpose |
|---|---|
| `supabase-add-fangorn.sql` | Migration: anchor columns on `minutes`, `public_notices`, `news` |
| `src/lib/fangorn-anchor.js` | Server-only anchoring module (lazy SDK import) |
| `scripts/anchor-records.mjs` | Backfill + retry sweep (`npm run anchor`) |
| `src/components/AnchorBadge.jsx` | Public "Filed in the permanent record" mark |
| `src/app/government/records/page.js` | Plain-language explainer + self-verify instructions |
| Edits | `upload-minutes`, `upload-notice`, `save-news` routes now fingerprint + anchor; badge wired into minutes & notices pages; styles in `pages.css`; sitemap entry |

## Setup

### 1. Run the migration

Supabase Dashboard → SQL Editor → paste `supabase-add-fangorn.sql` → Run.
(Safe to re-run.)

### 2. Create the city's publishing wallet

Create a **new, dedicated** Ethereum wallet for the city — never reuse a
personal one. Record the private key and the address somewhere the city
controls (not just your laptop): this key **is** the city's publishing
identity. If it's lost, a new identity must be registered and the archive
re-anchored under it; if it leaks, someone else can publish as the city.

Fund it with a small amount of **Arbitrum Sepolia testnet ETH** (free from any
Sepolia faucet, bridged to Arbitrum Sepolia). Anchoring costs fractions of a
cent-equivalent per batch.

### 3. Create a Pinata account

Free tier at pinata.cloud → create an API key (JWT) and note your dedicated
gateway URL. (Hash-only anchoring stores tiny metadata blocks, so usage is
negligible.)

### 4. Configure `.env.local`

```
FANGORN_PRIVATE_KEY=0x...
FANGORN_PINATA_JWT=eyJ...
FANGORN_PINATA_GATEWAY=https://your-gw.mypinata.cloud
FANGORN_APP_ID=piedmont-al
```

Add the same vars to your hosting provider (e.g. Vercel) as server-side env
vars so the live upload routes can anchor.

### 5. One-time on-chain registration

```bash
npm install
npx fangorn init        # interactive; or rely on ETH_PRIVATE_KEY / PINATA_* env vars
npx fangorn register    # registers the city wallet as a data publisher
```

If the app id `piedmont-al` has never been claimed, also run
`npx fangorn register-app` once.

### 6. Backfill the existing archive

```bash
npm run anchor -- --status   # see counts per table
npm run anchor -- --dry      # preview what will be anchored
npm run anchor               # anchor everything pending (≤3 transactions)
```

The sweep downloads each already-posted PDF, fingerprints it, stores the hash,
and anchors each table as one batch. From then on, new uploads anchor
automatically at post time; schedule `npm run anchor` (nightly cron or a
Vercel cron job hitting a small wrapper) as the retry net.

## Operations notes

- **Verify end-to-end once:** post a test notice, expand its badge, follow the
  ledger link, then delete the test row. (Deleting the DB row removes it from
  the site; the anchored fingerprint remains in the archive, which is the
  expected behavior — anchors are proof of publication, not the publication.)
- **Redactions:** because only hashes are anchored, replacing a PDF that
  accidentally contained private info is possible (swap the file in Storage,
  re-fingerprint, re-anchor). The old hash remains on record; the file it
  described does not. Establish a review step before posting rather than
  relying on this.
- **Status meanings:** `pending` (not yet attempted / awaiting sweep),
  `anchored`, `failed` (see `anchor_error`; sweep retries), `skipped` (set
  manually to exclude a record).

## Important caveats — read before presenting this to the city

1. **This is a pilot on a testnet.** Fangorn currently settles on Arbitrum
   *Sepolia*, a test network that offers no permanence guarantees and can be
   reset. The SHA-256 fingerprints stored in the city's own database are real
   and verifiable today, but do **not** describe the on-chain layer as
   "permanent" to officials until this moves to a production network. The
   records explainer page already words this honestly. When a mainnet
   deployment exists, re-running `npm run anchor` against it re-anchors the
   full history cheaply.
2. **Get sign-off.** These are the city's records. Present this as a
   tamper-evident backup/integrity layer and get approval from the clerk,
   mayor, or council before enabling it in production. Use the plain-language
   framing from `/government/records` — avoid crypto vocabulary.
3. **Key custody is civic infrastructure.** Decide with the city where the
   publishing key lives, who can use it, and how it's recovered. A key on one
   developer's laptop is a bus-factor problem for a public record.
4. **Project maturity.** The Fangorn SDK is young and moving fast (versions
   are date-stamped). Pin the version in `package.json` before production and
   review upstream changes before upgrading.
