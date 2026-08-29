-- ============================================================
-- CITY OF PIEDMONT — August 2026 updates, FINAL consolidated SQL
-- Supersedes supabase-updates-2026-08.sql, ...-v2.sql, and the
-- news/flyers scripts. Run this one in the Supabase SQL editor.
-- Safe to re-run, and safe whether or not any earlier version ran.
-- ============================================================

set timezone = 'America/Chicago';

-- ---------- CLEANUP: bulletin-board feature (dropped from the plan) ----------
drop table if exists public.flyers;
drop policy if exists "flyers bucket public read" on storage.objects;
drop policy if exists "flyers bucket staff write" on storage.objects;
-- If a 'flyers' storage bucket exists, it can be deleted from the
-- dashboard (Storage). It holds nothing important.

-- ---------- EVENTS: Downtown Trick or Treat ----------
-- Links to the flyer IMAGE (opens full size), not a PDF.
insert into public.events (title, event_date, end_date, location, description, category, url, all_day)
select
  'Downtown Trick or Treat',
  '2026-10-31 17:00'::timestamptz,
  '2026-10-31 19:00'::timestamptz,
  'Downtown Piedmont',
  'A night of candy, bounce houses, food trucks, and free face painting.',
  'holiday',
  'https://www.piedmontcity.org/images/news/downtown-halloween-2026.webp',
  false
where not exists (
  select 1 from public.events
  where title = 'Downtown Trick or Treat'
    and event_date >= '2026-10-31 00:00'::timestamptz
    and event_date <  '2026-11-01 00:00'::timestamptz
);

-- If the event was already inserted by an earlier script pointing at the PDF,
-- repoint it at the image.
update public.events
set url = 'https://www.piedmontcity.org/images/news/downtown-halloween-2026.webp'
where title = 'Downtown Trick or Treat'
  and url like '%downtown-halloween-2026-flyer.pdf';

-- ---------- EVENTS: City Council meetings, 1st & 3rd Tuesday, 6:00 PM ----------
insert into public.events (title, event_date, location, description, category, all_day)
select v.title, v.event_date::timestamptz, v.location, v.description, v.category, v.all_day
from (values
  ('City Council Meeting', '2026-09-01 18:00', 'Council Chambers, City Hall', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', false),
  ('City Council Meeting', '2026-09-15 18:00', 'Council Chambers, City Hall', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', false),
  ('City Council Meeting', '2026-10-06 18:00', 'Council Chambers, City Hall', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', false),
  ('City Council Meeting', '2026-10-20 18:00', 'Council Chambers, City Hall', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', false),
  ('City Council Meeting', '2026-11-03 18:00', 'Council Chambers, City Hall', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', false),
  ('City Council Meeting', '2026-11-17 18:00', 'Council Chambers, City Hall', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', false),
  ('City Council Meeting', '2026-12-01 18:00', 'Council Chambers, City Hall', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', false),
  ('City Council Meeting', '2026-12-15 18:00', 'Council Chambers, City Hall', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', false)
) as v(title, event_date, location, description, category, all_day)
where not exists (
  select 1 from public.events e
  where e.title = v.title
    and e.event_date = v.event_date::timestamptz
);

-- ---------- BUSINESS DIRECTORY: add the two missing businesses ----------
insert into public.businesses (name, slug, category, tagline, approved)
select 'Ervin Funeral Chapel', 'ervin-funeral-chapel', 'Services',
       'Funeral and cremation services at 212 Memorial Dr — 256-447-9595.', true
where not exists (select 1 from public.businesses where slug = 'ervin-funeral-chapel');

insert into public.businesses (name, slug, category, tagline, approved)
select 'Stevi B''s Pizza', 'stevi-bs-pizza', 'Dining',
       'Pizza buffet with specialty pies, pasta, and salad.', true
where not exists (select 1 from public.businesses where slug = 'stevi-bs-pizza');

-- ---------- NEWS: Downtown Trick or Treat ----------
insert into public.news (title, slug, body, content, published_at, image_url, image_alt)
select
  'Downtown Trick or Treat — Friday, October 31',
  'downtown-trick-or-treat-2026',
  'Bring the kids downtown on Halloween night, October 31, from 5:00 to 7:00 PM for trick-or-treating, bounce houses, food trucks, and free face painting.',
  E'Downtown Piedmont hosts Trick or Treat on Friday, October 31, 2026, from 5:00 to 7:00 PM.\n'
  || E'Along with candy from downtown merchants, the evening includes bounce houses, food trucks, and free face painting.\n'
  || 'The event is free and open to everyone. Tap the flyer to see the full-size version.',
  '2026-08-29',
  '/images/news/downtown-halloween-2026.webp',
  'Trick or Treat flyer: candy, bounce houses, food trucks, and free face painting, October 31, 2026, 5:00–7:00 PM, Downtown Piedmont'
where not exists (select 1 from public.news where slug = 'downtown-trick-or-treat-2026');

-- ---------- NEWS: Recreation Coordinator opening ----------
insert into public.news (title, slug, body, content, published_at, image_url, image_alt)
select
  'The City Is Hiring: Recreation Coordinator',
  'recreation-coordinator-opening-2026',
  'Parks & Recreation is hiring a Recreation Coordinator to run league sports, youth programs, and the Aquatic Center. Apply by Friday, September 4 at 5:00 PM.',
  E'The position runs Piedmont\u2019s league sports and youth programs end to end: scheduling and registration, recruiting coaches and participants, supervising Aquatic Center staff during swim season, and maintaining the Sports Complex.\n'
  || E'Benefits include RSA/State Retirement, accrued vacation, sick, and personal time, and BC/BS health, dental, and vision insurance.\n'
  || E'Apply in person at the Piedmont Administration Office, 109 N Center Ave, or email City Clerk Tashia Blackerby at tashia.blackerby@piedmontcity.org.\n'
  || 'Deadline to apply is Friday, September 4, 2026 at 5:00 PM. Tap the announcement to see the full details, or visit the Careers page.',
  '2026-08-29',
  '/images/news/recreation-coordinator-2026.webp',
  'Recreation Coordinator job announcement listing essential functions, benefits, and the September 4, 2026 application deadline'
where not exists (select 1 from public.news where slug = 'recreation-coordinator-opening-2026');
