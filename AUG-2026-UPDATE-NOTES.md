# August 2026 Update — Ben's Punch List

Every item from Ben's email, what was done, and the two setup steps that need
your action before deploying. The zip contains **only new/changed files** at
their correct paths — unzip over the project root and nothing else is touched.

---

## Changes made

### 1. Council meetings — 1st & 3rd Tuesday
The site text already says 1st and 3rd Tuesday everywhere (council page,
minutes page, Municipal Court page), so nothing to fix in code — if Ben saw
something different, the live deploy may be stale. What I did add: council
meetings now appear on the **Events calendar**. `supabase-updates-2026-08.sql`
inserts every remaining 2026 meeting (Sep 1, Sep 15, Oct 6, Oct 20, Nov 3,
Nov 17, Dec 1, Dec 15 — all 6:00 PM, Council Chambers).

### 2. Careers application error — FIXED (needs one file from you)
The "Application for Employment (PDF)" button pointed at the old WordPress
URL (`/wp-content/uploads/2021/12/APPLICATION.pdf`), which died with the old
site. It now points at `/documents/employment-application.pdf`.
**ACTION: drop the actual application PDF into `public/documents/` with that
exact filename.** Get it from Ben or the old server backup.

### 3. Recreation Coordinator posting — ADDED
`/careers` now has a "Current Positions" job card: summary, key duties,
benefits, the Friday Sept 4 2026 5:00 PM deadline, how to apply (Admin Office
/ Tashia Blackerby), and a button to the full announcement PDF (self-hosted at
`public/documents/recreation-coordinator-job-announcement.pdf`).
Future postings: edit the `OPENINGS` array at the top of
`src/app/careers/page.js`. Empty array = "no open positions" note returns.

### 4. Business page — Ervin Funeral Chapel + Stevi B's — ADDED via SQL
I read Ben's "no Ervin Funeral Home and no Stevi B's Pizza" as *these are
missing, add them*. The SQL inserts both (approved). Ervin Funeral Chapel's
details are confirmed: 212 Memorial Dr, 256-447-9595. Stevi B's Piedmont
details couldn't be confirmed online — fill in address/phone/photo at
`/admin/businesses`. If Ben actually meant **remove** them, just delete both
entries in `/admin/businesses` instead of running that part of the SQL.

### 5. Footer hours — FIXED
Now Monday–Friday, 8:00 AM–5:00 PM (was still showing the old Mon–Thu /
half-day-Friday schedule). Matches the live open/closed badge.

### 6. Halloween flyer on Events — ADDED via SQL
The SQL inserts "Downtown Trick or Treat" (Oct 31, 5:00–7:00 PM, Downtown
Piedmont, category Holiday). Its "More info →" link opens the flyer, self-
hosted at `public/documents/downtown-halloween-2026-flyer.pdf`.

### 7. Electronic Work Order page — NEW
`https://www.piedmontcity.org/electronic-work-order`

- Unlisted: not in the nav, not in the sitemap, `noindex` for search engines.
  Deliberately NOT in robots.txt (listing it there would advertise the URL).
  Anyone with the link can use it — same model as the old Google Form.
- Fields match the old form: Department dropdown, date picker, customer
  name/address/phone, instructions, optional photo (up to 8 MB, attached to
  the email), and the "Work Order Requested By" dropdown with the Mayor, all
  seven district council members, Administration Office, and Police Dept.
- Submissions email to **payments@piedmontcity.org** with subject
  "New submission from Online Work Order", formatted as a labeled table like
  the old form's emails.
- Spam protection: hidden honeypot field + server-side validation that only
  accepts the exact dropdown values.
- The department list is a plain array at the top of
  `src/app/electronic-work-order/WorkOrderForm.jsx` — edit as needed (I seeded
  it with Street, Water & Gas, Power & Light, Sanitation, Parks & Rec,
  Cemetery, Public Works–Other; confirm the list with Ben). If you change it,
  mirror the change in `src/app/api/work-order/route.js` (server allow-list).

### 8. Contact form now actually sends (bonus fix)
The existing contact form showed "Message sent" without sending anything.
It now posts to `/api/contact` → emails info@piedmontcity.org via the same
email service. Revert `src/components/ContactForm.jsx` if you don't want this.

---

## Setup required before deploy

### A. Email sending (Resend) — required for work orders + contact form
The project now uses [Resend](https://resend.com) (added to package.json —
run `npm install`).

1. Create a Resend account and verify **piedmontcity.org** as a sending
   domain (Resend gives you a few DNS records — SPF/DKIM — to add wherever
   the city's DNS is managed).
2. Create an API key.
3. In Vercel → Project → Settings → Environment Variables, add:
   - `RESEND_API_KEY` — required
   - `WORK_ORDER_TO` — optional, defaults to payments@piedmontcity.org
   - `WORK_ORDER_FROM` — optional, defaults to
     `City of Piedmont <workorder@piedmontcity.org>`
   - `CONTACT_TO` — optional, defaults to info@piedmontcity.org
   - `CONTACT_FROM` — optional
4. Redeploy. Until the key is set, both forms show a friendly "could not
   send" error instead of failing silently.

Free tier is 100 emails/day — plenty for this.

### B. Supabase content
Run `supabase-updates-2026-08.sql` in the Supabase SQL editor (safe to
re-run; every insert skips rows that already exist). Or do the same by hand
in `/admin/events` and `/admin/businesses`.

### C. Employment application PDF
Add the file per item 2 above. Everything else ships working.

---

## Files in this zip

```
package.json                                        (+ resend dependency)
supabase-updates-2026-08.sql                        (events + businesses)
src/components/Footer.jsx                           (hours fix)
src/components/ContactForm.jsx                      (real sending)
src/app/careers/page.js                             (application link + job posting)
src/app/careers/careers.css                         (job card styles)
src/app/electronic-work-order/page.js               (new)
src/app/electronic-work-order/WorkOrderForm.jsx     (new)
src/app/electronic-work-order/work-order.css        (new)
src/app/api/work-order/route.js                     (new)
src/app/api/contact/route.js                        (new)
public/documents/recreation-coordinator-job-announcement.pdf
public/documents/downtown-halloween-2026-flyer.pdf
```

Build verified clean: all routes compile, `/electronic-work-order` renders,
both API routes bundle, and the work order page is absent from the sitemap.
(Note: your zip was missing `src/app/globals.css`; I built against a
temporary stub and did **not** include any globals.css here, so your real one
is untouched.)
