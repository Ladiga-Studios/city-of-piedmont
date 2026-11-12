-- ============================================================
-- CITY OF PIEDMONT — event flyer images
-- Applied Nov 12, 2026. Safe to re-run.
-- Powers the flyer thumbnail on /events and the Flyer field
-- in /admin/events.
-- ============================================================
alter table public.events add column if not exists image_url text;
alter table public.events add column if not exists image_alt text;
