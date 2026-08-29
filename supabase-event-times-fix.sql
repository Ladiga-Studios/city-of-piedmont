-- ============================================================
-- CITY OF PIEDMONT — event time fix + news article links
-- Run in the Supabase SQL editor AFTER the earlier FINAL script.
-- Safe to re-run.
--
-- Why: the admin console saves wall-clock times as-is (UTC under
-- the hood) and the site renders them the same way, so a 6:00 PM
-- meeting must be STORED as 18:00, not 23:00 UTC. The earlier
-- script stored Central-adjusted times, which displayed as
-- 11:00 PM. This resets every affected event to plain wall time.
-- ============================================================

-- ---------- FIX: council meetings -> stored as 18:00 (displays 6:00 PM) ----------
update public.events
set event_date = (event_date at time zone 'America/Chicago')::timestamp at time zone 'UTC'
where title = 'City Council Meeting'
  and event_date in (
    '2026-09-01 18:00-05', '2026-09-15 18:00-05',
    '2026-10-06 18:00-05', '2026-10-20 18:00-05',
    '2026-11-03 18:00-06', '2026-11-17 18:00-06',
    '2026-12-01 18:00-06', '2026-12-15 18:00-06'
  );

-- ---------- FIX: Trick or Treat -> stored as 17:00–19:00 (displays 5–7 PM) ----------
update public.events
set event_date = (event_date at time zone 'America/Chicago')::timestamp at time zone 'UTC',
    end_date   = (end_date   at time zone 'America/Chicago')::timestamp at time zone 'UTC'
where title = 'Downtown Trick or Treat'
  and event_date = '2026-10-31 17:00-05';

-- ---------- LINK: events "More info" now opens the news article page ----------
update public.events
set url = 'https://www.piedmontcity.org/news/downtown-trick-or-treat-2026'
where title = 'Downtown Trick or Treat'
  and (url like '%downtown-halloween-2026%' or url is null);

-- ============================================================
-- HEADS-UP (no action taken): the events table contains a
-- "City Council Meeting" on Tue Sep 8 at 5:30 PM — that's the
-- 2nd Tuesday, not 1st/3rd, and it was entered via the admin
-- console before these updates. If it isn't a special called
-- meeting, delete it at /admin/events, or uncomment:
--
-- delete from public.events
-- where title = 'City Council Meeting'
--   and event_date >= '2026-09-08 00:00' and event_date < '2026-09-09 00:00';
-- ============================================================
