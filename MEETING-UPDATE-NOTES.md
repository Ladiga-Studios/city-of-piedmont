# August 2026 City Hall Walkthrough — Changes Made

Everything below came out of the in-person review with the Piedmont folks.

## Content corrections

- **City Hall hours** are now Monday–Friday, 8:00 AM–5:00 PM everywhere: the live
  "open/closed" badge (`src/lib/city-hours.js`), the contact page, the top bar, and
  the homepage panel (the last two read from the same source).
- **Pay Your Bill** (Residents page) now says bills are paid in person at the
  **utility office, 128 South Center Ave** — not City Hall.
- **Business License** (Residents page) now lists **Amy Rawson** with her direct
  line, **256-447-3564**, so calls ring straight to her instead of the operator.
- **Public Works hours** now show the seasonal flip: 6:00 a.m.–2:30 p.m. during
  daylight saving time, 7:00 a.m.–3:30 p.m. on standard time.
- **Staff moves:** Patti Byers moved from Administrative to the utility office
  (Water & Gas now lists Byrian, Tammy, Mackenzie, and Patti). Brittany Humphrey
  moved to the Civic Center and is listed there as Membership Coordinator.
- **Sticky header** is now solid (no see-through effect) with a stronger shadow
  once you scroll, per Craig's note that he didn't like how it "sticks with you."
- **Council page** now supports a short "get to know them" bio under each member's
  photo. When the Mayor sends the questionnaire paragraphs, paste them in at
  `/admin/people` — no code change needed.
- City Hall address was already 109 North Center Avenue site-wide (confirmed).
- Library hours were confirmed correct as-is (8–4, Wednesday half day, closed
  Saturday).
- Report-a-problem routing was confirmed: streets & drainage → Tim Frost
  (256-447-3572), code enforcement → Charles McDonald (256-447-3562).

## New: People console (`/admin/people`)

Add, edit, or remove anyone shown on the site — the Mayor, council members, and
department staff — including name, role, department, email, phone, headshot, and
(for council) a bio. Public pages update within a minute. So the next time someone
moves offices or retires, it's a 30-second edit, not a support email.

## New: City Documents console (`/admin/documents`)

Upload any city PDF (water quality reports, permit forms, applications, Word/Excel
accepted too), pick which department page it shows on and which section it joins
(e.g. new water reports land in the existing "Water Quality Reports" list on the
Water & Gas page). Delete removes it from the page and from storage.

Both new sections appear in the admin sidebar, on the Overview dashboard, and in
Quick Actions.

## One-time setup (before the new consoles work)

1. In Supabase → Storage, create two **public** buckets: `people-photos` and
   `city-documents`.
2. In Supabase → SQL Editor, run `supabase-add-people-documents.sql`. It creates
   the two tables, security policies, and seeds the current council and staff
   (with the Patti/Brittany moves already applied).

Until the SQL is run, the public pages simply keep showing their built-in lists,
and the admin pages show a setup reminder — nothing breaks.

## Business directory cleanup (do in admin)

Confirmed at the meeting: **Irvin Funeral Home** and **Dansby** have closed;
**Thompson** is the only funeral home left. Remove the two closed listings at
`/admin/businesses` (or use the optional SQL at the bottom of
`supabase-add-people-documents.sql`).

## Noted for later (not built yet)

- SMS/text alert signup alongside email notifications — they were very interested.
- Christmas parade float signup form (online registration, no fee, emails the
  organizer).
- Fillable online versions of the building permit / business license PDFs — Ben is
  sending updated forms first.
- Weekly event-scan seeding of the calendar.
- Possible in-site email accounts vs. keeping the current provider — pending their
  decision on the email side.
