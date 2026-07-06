# News & Events — full system + seeded content

News and events are now a real database-backed system with an admin UI, matching
the Notices pattern. Before this, the homepage news/events were hardcoded placeholder
arrays and `/news` was a "coming soon" stub.

## One-time Supabase setup

Run **`supabase-add-news-events.sql`** in Supabase → SQL Editor. It:
- Creates a **`news`** table (there wasn't one) with RLS (public read, staff write).
- Adds optional columns to the **existing `events`** table (`end_date`, `all_day`,
  `category`, `url`, `is_sample`) — safe to re-run.
- **Seeds real Piedmont events** for the rest of 2026 (see list below) and three
  clearly-flagged sample news articles.

No new env vars and no storage bucket needed — news/events are text + an optional
image URL, so there's nothing to upload.

## What residents see

- **`/news`** — real news page (replaces the stub). Cards with date, summary, optional
  image, and an optional "Read more" for longer articles.
- **`/events`** — new events calendar, grouped by month, newest first, with maroon date
  chips, category tags, time/location, and "More info" links.
- **Homepage** — the "Latest News" (3 newest) and "Upcoming Events" (next 4) sections now
  pull live from the database. If the DB is empty or unreachable, they fall back to the
  original built-in samples so the page never looks broken. The events links now go to
  `/events`.
- **Nav** — to avoid widening the already-full menu bar, **Events Calendar** is a dropdown
  under **News** (same approach used for Careers under About).

## What staff can do

- **`/admin/news`** — write/edit/delete articles (headline, date, summary, optional full
  body, optional image URL). The 3 newest show on the homepage; all show on `/news`.
- **`/admin/events`** — add/edit/delete events (title, category, all-day toggle, start/end
  date-time, location, description, optional info link). Split into Upcoming and Past.
- Both use a styled confirm modal for deletes (no native `confirm()`), and the Admin
  overview gained "News Articles" and "Upcoming Events" count cards plus quick actions.
- Anything a staff member saves or edits drops the "Sample" flag automatically.

## Seeded events (real, sourced for the rest of 2026)

Recurring city meetings (from the city's own events calendar):
- **City Council Meeting** — 1st & 3rd Monday, 5:30 PM, City Council Chambers (Jul–Dec).
- **Piedmont Arts & Entertainment Committee Meeting** — 2nd Thursday monthly, Civic Center.

Community events (from allevents.in/piedmont-al, the AL festival guide, and local press):
- **Shake N Brake Gravel Race** — Jun 27, 9 AM, Shell's Downtown
- **6th Annual Independence Day Celebration** — Jul 4, 4–8 PM, Piedmont Sports Complex
- **Snead's Farmhouse: Little Chickens, Big Dreams** — Jul 10, 11 AM, 106 N Main St
- **Awakening '26** — Jul 11, 5 PM, Piedmont High School
- **Illumination Station VBS** — Jul 13–15, 6–8 PM, Trinity Missionary Baptist
- **Murder Mystery on the Buffalo Express** — Aug 1, 7 PM, Piedmont Depot Museum
- **Hispanic Festival** — Sep 19 (date per the AL festival guide; confirm closer to time)
- **Rock Run Community Christmas Parade** — Dec 19, 2 PM, Cherokee County (area event)

### Accuracy notes
- Each event links back to its source where one exists, so the city can verify details.
- A few all-day/festival entries (Hispanic Festival, Rock Run parade) have approximate
  dates pulled from listing sites rather than an official city page — they're flagged in
  their descriptions to "confirm." Edit or remove any of them in `/admin/events`.
- I deliberately **excluded** "Piedmont Founders Day" — that result was for Piedmont,
  **Oklahoma**, not Alabama. Same with several Eventbrite/Bandsintown hits for Piedmont
  CA, Piedmont Park (Atlanta), and Piedmont SD.
- The seeded **news** items are marked as samples (they show a "Sample" badge in admin).
  They reference real Piedmont facts (the July 4 event, the water quality report, the
  Chief Ladiga Trail) but are meant as starting points — replace them with real
  announcements when you have them.

## Files

**Added**
- `supabase-add-news-events.sql`
- `src/lib/news-events.js`
- `src/app/news/page.js`, `src/app/news/news.css`
- `src/app/events/page.js`, `src/app/events/events.css`
- `src/app/admin/news/page.js`, `src/app/admin/news/ne-admin.css`
- `src/app/admin/events/page.js`, `src/app/admin/events/ne-admin.css`
- `src/app/api/admin/save-news/route.js`
- `src/app/api/admin/save-event/route.js`

**Changed**
- `src/app/page.js` — homepage now fetches live news/events (with sample fallback); events links → `/events`
- `src/components/AdminNav.jsx` — News and Events sidebar links
- `src/app/admin/page.js` — count cards + quick actions for news and events
- `src/lib/site.js` — Events Calendar added under News
- `src/app/sitemap.js` — `/news` and `/events` added
