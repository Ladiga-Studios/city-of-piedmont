# Public Notices & Bid Requests — what was added

This adds a **Public Notices & Bid Requests** section to the public site plus an
**admin console** area to upload notice/bid PDFs. It follows the same pattern as
the existing Council Minutes feature (PDF → Supabase Storage → DB row → public page).

## One-time Supabase setup

1. **SQL:** In Supabase → SQL Editor, run **`supabase-add-public-notices.sql`**.
   - Creates the `public_notices` table + row-level security (public read, staff write).
   - Seeds the 3 notices currently on piedmontcity.org (the three ordinances), pointing
     at the existing live PDFs so the page isn't empty on day one.
2. **Storage bucket:** In Supabase → Storage, create a **public** bucket named
   **`notices-files`**, then run the three storage policies noted at the bottom of that
   same SQL file (commented out).

No new environment variables are needed — it uses the same Supabase keys already in `.env.local`.

> Naming note: the existing `notices` table in the schema powers the **site-wide alert
> banners** (the "Site Alerts" admin page). To avoid any collision, this feature uses a
> **separate** `public_notices` table.

## What residents see

- New page: **`/government/notices`** — "Public Notices & Bid Requests".
  - Two sections: **Public Notices** and **Bid Requests**, each newest-first.
  - Every item shows its posted date and a **Download PDF** button.
  - Bids can show a "Closes <date>" tag (and flip to "Closed" once past).
  - The "Public Notices & Bids" cards/links in the nav and on `/government` now point here.

## What staff can do

- New admin page: **`/admin/notices`** ("Notices & Bids" in the sidebar).
  - Toggle between **Public Notice** and **Bid Request**.
  - Enter a title + posted date, (optional closing date for bids), pick a PDF, post.
  - See everything posted, open any PDF, and delete with a styled confirm modal
    (no native `confirm()` / `alert()`).
  - The Admin overview now shows a "Notices & Bids" count card + quick action.

## Replacing the seeded external PDFs (optional)

The 3 seeded ordinances link to the PDFs still hosted on piedmontcity.org. They work as-is.
When convenient, re-upload each through `/admin/notices` (which stores them in your own
`notices-files` bucket) and delete the seeded rows — deleting a seeded ("External PDF")
row only removes it from the list and leaves the original file untouched.

## Files added / changed

**Added**
- `supabase-add-public-notices.sql`
- `src/lib/notices-format.js`
- `src/app/api/admin/upload-notice/route.js`
- `src/app/government/notices/page.js`
- `src/app/government/notices/NoticesList.jsx`
- `src/app/government/notices/notices.css`
- `src/app/admin/notices/page.js`
- `src/app/admin/notices/notices-admin.css`

**Changed**
- `src/components/AdminNav.jsx` — added "Notices & Bids" sidebar link
- `src/app/admin/page.js` — added count card + quick action
- `src/lib/site.js` — nav "Public Notices & Bids" now → `/government/notices`
- `src/app/government/page.js` — card now → `/government/notices`
- `src/app/sitemap.js` — added `/government/notices`
