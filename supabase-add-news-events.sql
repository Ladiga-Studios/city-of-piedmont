-- ============================================================
-- CITY OF PIEDMONT — News & Events
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor).
--
-- This powers the public /news and /events pages, the homepage
-- "Latest News" and "Upcoming Events" sections, and the
-- /admin/news and /admin/events consoles.
-- ============================================================

-- ---------------- NEWS ----------------
-- (new table; there was no news table before)
create table if not exists public.news (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text,
  body         text not null,              -- short summary shown in cards
  content      text,                       -- optional longer article body
  published_at date not null default current_date,
  image_url    text,                       -- optional hero image (URL)
  image_alt    text,
  is_sample    boolean not null default false,  -- flags seeded placeholder items
  created_at   timestamptz not null default now()
);

create index if not exists news_published_idx on public.news (published_at desc);

-- ---------------- EVENTS ----------------
-- The events table already exists with:
--   id, title, event_date (timestamptz), location, description, created_at
-- Add a few optional columns the calendar/admin use. Safe to re-run.
alter table public.events add column if not exists end_date    timestamptz;
alter table public.events add column if not exists all_day     boolean not null default false;
alter table public.events add column if not exists category    text default 'community';  -- community | meeting | festival | recreation | holiday
alter table public.events add column if not exists url         text;                      -- external info/registration link
alter table public.events add column if not exists is_sample   boolean not null default false;

create index if not exists events_date_idx on public.events (event_date);

-- ---------------- ROW LEVEL SECURITY ----------------
alter table public.news enable row level security;

-- events RLS already exists from the base schema; news mirrors it.
create policy "public read news"  on public.news for select using (true);
create policy "staff write news"  on public.news for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- SEED: real Piedmont, AL events for the rest of 2026.
-- Sources: City of Piedmont events calendar (council meetings),
-- allevents.in/piedmont-al, piedmontfoundersday (excluded - OK),
-- festival guide, and local press for the Rock Run parade.
-- Times are stored at local clock time; adjust tz handling to taste.
-- ============================================================
insert into public.events (title, event_date, end_date, location, description, category, url, all_day) values
  -- Recurring City Council meetings: 1st & 3rd Monday, 5:30 PM, Council Chambers
  ('City Council Meeting', '2026-07-06 17:30', null, 'City Council Chambers', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', null, false),
  ('City Council Meeting', '2026-07-20 17:30', null, 'City Council Chambers', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', null, false),
  ('City Council Meeting', '2026-08-03 17:30', null, 'City Council Chambers', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', null, false),
  ('City Council Meeting', '2026-08-17 17:30', null, 'City Council Chambers', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', null, false),
  ('City Council Meeting', '2026-09-08 17:30', null, 'City Council Chambers', 'Regular meeting of the Piedmont City Council. Open to the public. (First Monday is Labor Day; meeting held the following week.)', 'meeting', null, false),
  ('City Council Meeting', '2026-09-21 17:30', null, 'City Council Chambers', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', null, false),
  ('City Council Meeting', '2026-10-05 17:30', null, 'City Council Chambers', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', null, false),
  ('City Council Meeting', '2026-10-19 17:30', null, 'City Council Chambers', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', null, false),
  ('City Council Meeting', '2026-11-02 17:30', null, 'City Council Chambers', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', null, false),
  ('City Council Meeting', '2026-11-16 17:30', null, 'City Council Chambers', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', null, false),
  ('City Council Meeting', '2026-12-07 17:30', null, 'City Council Chambers', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', null, false),
  ('City Council Meeting', '2026-12-21 17:30', null, 'City Council Chambers', 'Regular meeting of the Piedmont City Council. Open to the public.', 'meeting', null, false),

  -- Recurring PAEC planning meeting: 2nd Thursday monthly, Civic Center
  ('Piedmont Arts & Entertainment Committee Meeting', '2026-07-09 00:00', null, 'Clyde H. Pike Civic Center', 'The Piedmont Arts & Entertainment Committee meets to plan upcoming community events. The public is welcome to attend and share feedback.', 'meeting', 'https://allevents.in/piedmont/paec-monthly-planning-meeting/200030175457453', true),
  ('Piedmont Arts & Entertainment Committee Meeting', '2026-08-13 00:00', null, 'Clyde H. Pike Civic Center', 'The Piedmont Arts & Entertainment Committee meets to plan upcoming community events. The public is welcome to attend and share feedback.', 'meeting', null, true),
  ('Piedmont Arts & Entertainment Committee Meeting', '2026-09-10 00:00', null, 'Clyde H. Pike Civic Center', 'The Piedmont Arts & Entertainment Committee meets to plan upcoming community events. The public is welcome to attend and share feedback.', 'meeting', null, true),
  ('Piedmont Arts & Entertainment Committee Meeting', '2026-10-08 00:00', null, 'Clyde H. Pike Civic Center', 'The Piedmont Arts & Entertainment Committee meets to plan upcoming community events. The public is welcome to attend and share feedback.', 'meeting', null, true),
  ('Piedmont Arts & Entertainment Committee Meeting', '2026-11-12 00:00', null, 'Clyde H. Pike Civic Center', 'The Piedmont Arts & Entertainment Committee meets to plan upcoming community events. The public is welcome to attend and share feedback.', 'meeting', null, true),
  ('Piedmont Arts & Entertainment Committee Meeting', '2026-12-10 00:00', null, 'Clyde H. Pike Civic Center', 'The Piedmont Arts & Entertainment Committee meets to plan upcoming community events. The public is welcome to attend and share feedback.', 'meeting', null, true),

  -- Community events
  ('Shake N Brake Gravel Race', '2026-06-27 09:00', null, 'Shell''s Downtown, Piedmont', 'The finale of the Smalltown Gravel Series, often called the hardest gravel race in the series, rolls out from downtown Piedmont.', 'recreation', 'https://allevents.in/piedmont/shake-n-brake-gravel-race/200029159702926', false),
  ('6th Annual Independence Day Celebration', '2026-07-04 16:00', '2026-07-04 20:00', 'Piedmont Sports Complex', 'A festival of food, fun, and fireworks at the Piedmont Sports Complex from 4 PM to 8 PM. Vendors sell food; live music and activities are free. Fireworks at 8 PM.', 'festival', 'https://allevents.in/piedmont/6th-annual-independence-day-celebration/200029816560055', false),
  ('Snead''s Farmhouse: Little Chickens, Big Dreams', '2026-07-10 11:00', null, '106 N Main St, Piedmont', 'A 45-minute children''s program with a book presentation, small animals for petting and learning, and a dance party. A sensory-friendly show follows at 12 PM.', 'community', 'https://allevents.in/piedmont/sneads-farmhouse-little-chickens-big-dreams-11-am-sensory-friendly-show-12-pm/200030104649941', false),
  ('Awakening ''26', '2026-07-11 17:00', null, 'Piedmont High School', 'A night of worship and music featuring Tori Parris, the band Hall''e, and worship by The Family.', 'community', 'https://allevents.in/piedmont/awakening-26/200030060170157', false),
  ('Illumination Station VBS', '2026-07-13 18:00', '2026-07-15 20:00', 'Trinity Missionary Baptist Church', 'Vacation Bible School for Pre-K through 6th grade, 6:00–8:00 PM nightly. A church van runs each night; for transportation call 256-454-0081.', 'community', 'https://allevents.in/piedmont/illumination-station-vbs/200030303848226', false),
  ('Murder Mystery on the Buffalo Express', '2026-08-01 19:00', '2026-08-01 22:00', 'Piedmont Historical Depot Museum', 'A mystery dinner aboard the Buffalo Express at the Historic Piedmont Depot — clues, laughs, and dinner. Ticketed event.', 'community', 'https://allevents.in/piedmont/mder-mystery-on-the-buffalo-express-a-mystery-dinner-to-die-for/100001990695849875', false),
  ('Hispanic Festival', '2026-09-19 00:00', null, 'Piedmont', 'Annual Hispanic Festival in Piedmont celebrating Hispanic culture, food, and music. (Date per the Alabama festival guide; confirm details closer to the date.)', 'festival', null, true),
  ('Rock Run Community Christmas Parade', '2026-12-19 14:00', null, 'Rock Run Baptist Church, Cherokee County', 'One of Alabama''s largest and longest-running Christmas parades, drawing crowds from across the region. Lineup in the late morning; parade rolls at 2 PM. Food and music at the Fellowship Hall and Community Center. (Area event near Piedmont — confirm the 2026 date.)', 'holiday', null, false)
on conflict do nothing;

-- ============================================================
-- SEED: sample news. These are clearly flagged as samples
-- (is_sample = true) and reference real Piedmont items. Replace
-- or delete them from /admin/news once real announcements exist.
-- ============================================================
insert into public.news (title, body, published_at, is_sample) values
  ('Independence Day Celebration Returns July 4 at the Sports Complex', 'The City''s 6th Annual Independence Day Celebration brings food, live music, and fireworks to the Piedmont Sports Complex on July 4, 4–8 PM. Activities are free; fireworks begin at 8 PM.', '2026-06-15', true),
  ('2026 Drinking Water Quality Report Now Available', 'The City''s annual Drinking Water Quality Report is available to residents. Find it on the Water & Gas department page along with prior years'' reports and PFAS/PFOS results.', '2026-06-10', true),
  ('Chief Ladiga Trail: A Local Treasure for Walking and Cycling', 'The paved Chief Ladiga Trail runs through downtown Piedmont and connects to Georgia''s Silver Comet Trail, forming nearly 100 miles of continuous paved trail. It''s open year-round for walking, jogging, and biking.', '2026-06-01', true)
on conflict do nothing;
