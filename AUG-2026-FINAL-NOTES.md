# August 2026 Updates — FINAL package

**This zip replaces every previous zip from this round.** Unzip over the
project root and let it overwrite. It contains the complete, final state of
every changed file, so it doesn't matter which earlier zips you did or
didn't apply.

Run `supabase-updates-2026-08-final.sql` in the Supabase SQL editor — it
likewise supersedes all earlier SQL files and is safe to run regardless of
which (if any) ran before. Delete the older .sql files from the repo.

## What's in the final state

1. **Footer hours** — Monday–Friday, 8:00 AM–5:00 PM.
2. **Careers** — no employment application download (city has no PDF yet;
   restore instructions are commented in `careers/page.js`). Recreation
   Coordinator posting card with a "View Full Job Announcement" button that
   opens a high-res image of the announcement.
3. **News articles** (via SQL) — one for Downtown Trick or Treat with the
   flyer image, one for the Recreation Coordinator opening with the
   announcement image. They appear on /news and in "Latest News" on the
   homepage. **News images are now clickable everywhere** — tapping opens
   the full-size image in a new tab, with a gentle hover cue.
4. **Bulletin board — REMOVED.** No homepage section, no admin page, no
   flyers table. The SQL cleans up the table/policies if an earlier script
   created them. (If a 'flyers' storage bucket exists in Supabase, delete
   it from the dashboard.) Future flyers: post them as news articles from
   /admin/news with the flyer as the article image.
5. **Events** (via SQL) — Trick or Treat (Oct 31, 5–7 PM; "More info" opens
   the flyer image, not a PDF) and all remaining 2026 council meetings
   (1st & 3rd Tuesdays, 6:00 PM).
6. **Businesses** (via SQL) — Ervin Funeral Chapel (212 Memorial Dr,
   256-447-9595) and Stevi B's Pizza (fill in details at /admin/businesses).
7. **Electronic Work Order** — unlisted /electronic-work-order page,
   noindex, matches the old Google Form; emails payments@piedmontcity.org
   with photo attached. Needs RESEND_API_KEY (see below).
8. **Contact form** — now actually sends (to info@piedmontcity.org).

## Still required

- **Resend**: DNS records at GoDaddy (waiting on Ben's contact), then
  RESEND_API_KEY in Vercel env vars, then redeploy. Until then both forms
  show a friendly "could not send" error.
- `npm install` (the resend package was added to package.json).

## Posting future flyers (the new workflow)

/admin/news → new article → upload the flyer image as the article photo,
write a 1–2 sentence summary, put details in the content field. It shows on
the homepage (3 newest) and /news, and readers tap the image for full size.
If it's also a dated event, add it at /admin/events too with the image URL
as the "More info" link.
