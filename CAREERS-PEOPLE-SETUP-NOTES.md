# Careers console + People offices — setup notes (Sept 2026)

## What's new

**Careers (/admin/careers)** — post a job opening from the admin console.
- Upload the announcement (PDF, or a photo/scan of the flyer). The site reads
  it and drafts the posting in the same style the Careers page already uses:
  title, department, deadline, overview, duties, pay, benefits, how to apply.
  Staff check the draft and click Post.
- "Also post a Now Hiring article to News" (on by default) publishes a
  matching article with the flyer as its image.
- The posting AND its article disappear from the public site by themselves
  the day after the application deadline (Central time). No cron, nothing to
  remember: it's enforced by row-level security, so anonymous visitors simply
  can't read expired rows. Staff still see them in the console marked
  "Expired — hidden" and can edit the deadline to re-open one.
- The current Recreation Coordinator opening is seeded into the table and
  linked to its existing news article, so nothing changes on the site today
  and both drop off after Sept 4.

**People (/admin/people)** — Police and Fire chiefs are now editable.
- New "Office on that page" selector for departments with sub-offices
  (Public Safety → Police Department / Fire Department).
- Nathan Johnson (Chief of Police) and Todd Kirkland (Fire Chief) are seeded
  so everyone on the site is now in the console.

## Files

New
- `supabase-careers.sql`                 job_postings table, careers bucket, news expiry, seed
- `supabase-people-offices.sql`          people.office column + Police/Fire chiefs
- `src/app/admin/careers/page.js`, `careers-admin.css`
- `src/app/api/admin/analyze-job/route.js`   reads the announcement (Claude)
- `src/app/api/admin/save-job/route.js`      create/update/delete + news sync
- `src/lib/summarize-job.js`

Changed
- `src/app/careers/page.js`              reads from job_postings (static list is fallback only)
- `src/app/admin/people/page.js`         office selector
- `src/lib/people.js`, `src/app/departments/[slug]/page.js`   office-aware staff lists
- `src/app/admin/news/page.js`           "Expires …" / "Expired — hidden" tags
- `src/components/AdminNav.jsx`, `src/app/admin/page.js`     nav + overview

(`src/lib/drive.js` from the File Drive update is also used here for the
image resize helper — install that update first.)

## Deploy steps

1. Unzip over the project root.
2. Supabase → SQL Editor → run `supabase-careers.sql`, then `supabase-people-offices.sql`.
3. `ANTHROPIC_API_KEY` must be set in Vercel (it already is for minutes
   summaries). Without it the console still works; staff just fill the
   fields in by hand.
4. Push / deploy.

## Notes

- Announcements upload straight from the browser to the `careers` bucket, so
  large scans aren't blocked by Vercel's 4.5 MB request limit. Photos over
  1.5 MB are sent to the reader as a downsized copy; the original is what
  visitors open.
- Any news article can now be given an `expires_at` in the database and it
  will drop off the site at that time. The News console doesn't expose the
  field yet — say the word if you want a date picker there too.
- The homepage bulletin board (flyers table) is separate and isn't touched by
  a job posting; if a flyer for the opening is pinned there, remove it from
  /admin/flyers when it's done.
