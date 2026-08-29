-- ============================================================
-- CITY OF PIEDMONT — August 2026 content updates (Ben's list)
-- Run in the Supabase SQL editor (Dashboard > SQL Editor).
-- Everything here can also be done by hand in /admin/events and
-- /admin/businesses — this file just saves the typing.
-- Safe to re-run: inserts skip rows that already exist by title/name.
-- ============================================================

-- ---------- EVENTS: Downtown Trick or Treat (Halloween flyer) ----------
-- The flyer PDF is served by the site at /documents/downtown-halloween-2026-flyer.pdf
-- and shows as the "More info →" link on the event.
insert into public.events (title, event_date, end_date, location, description, category, url, all_day)
select
  'Downtown Trick or Treat',
  '2026-10-31 17:00',
  '2026-10-31 19:00',
  'Downtown Piedmont',
  'A night of candy, bounce houses, food trucks, and free face painting.',
  'holiday',
  'https://www.piedmontcity.org/documents/downtown-halloween-2026-flyer.pdf',
  false
where not exists (
  select 1 from public.events where title = 'Downtown Trick or Treat' and event_date::text like '2026-10-31%'
);

-- ---------- EVENTS: City Council meetings, 1st & 3rd Tuesday, 6:00 PM ----------
-- Remaining 2026 dates. Add 2027 dates the same way when the new year is set.
insert into public.events (title, event_date, end_date, location, description, category, all_day)
select * from (values
  ('City Council Meeting', '2026-09-01 18:00', null, 'Council Chambers, City Hall', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', false),
  ('City Council Meeting', '2026-09-15 18:00', null, 'Council Chambers, City Hall', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', false),
  ('City Council Meeting', '2026-10-06 18:00', null, 'Council Chambers, City Hall', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', false),
  ('City Council Meeting', '2026-10-20 18:00', null, 'Council Chambers, City Hall', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', false),
  ('City Council Meeting', '2026-11-03 18:00', null, 'Council Chambers, City Hall', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', false),
  ('City Council Meeting', '2026-11-17 18:00', null, 'Council Chambers, City Hall', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', false),
  ('City Council Meeting', '2026-12-01 18:00', null, 'Council Chambers, City Hall', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', false),
  ('City Council Meeting', '2026-12-15 18:00', null, 'Council Chambers, City Hall', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', false)
) as v(title, event_date, end_date, location, description, category, all_day)
where not exists (
  select 1 from public.events e
  where e.title = 'City Council Meeting' and e.event_date::text = v.event_date
);

-- ---------- BUSINESS DIRECTORY: add the two missing businesses ----------
-- Ervin Funeral Chapel (Piedmont location): 212 Memorial Dr, 256-447-9595.
-- Stevi B's Pizza: details not confirmed online — add the address/phone/photo
-- in /admin/businesses once you have them.
insert into public.businesses (name, slug, category, tagline, approved)
select 'Ervin Funeral Chapel', 'ervin-funeral-chapel', 'Services',
       'Funeral and cremation services at 212 Memorial Dr — 256-447-9595.', true
where not exists (select 1 from public.businesses where slug = 'ervin-funeral-chapel');

insert into public.businesses (name, slug, category, tagline, approved)
select 'Stevi B''s Pizza', 'stevi-bs-pizza', 'Dining',
       'Pizza buffet with specialty pies, pasta, and salad.', true
where not exists (select 1 from public.businesses where slug = 'stevi-bs-pizza');
