-- ============================================================
-- CITY OF PIEDMONT — expand businesses for the rich directory
-- Run in the Supabase SQL Editor. Safe on the existing table.
-- ============================================================

alter table public.businesses
  add column if not exists slug         text,                    -- URL: /business/<slug>
  add column if not exists tagline      text,                    -- one-line summary for cards
  add column if not exists hours        jsonb default '[]'::jsonb,-- [{day, open, close}] or freeform lines
  add column if not exists email        text,
  add column if not exists facebook     text,
  add column if not exists instagram    text,
  add column if not exists lat          double precision,        -- for the map
  add column if not exists lng          double precision,
  add column if not exists gallery      jsonb default '[]'::jsonb,-- array of image URLs
  add column if not exists featured     boolean default false;   -- pin to top of directory

-- Make slug unique so each business has a stable, unique URL.
create unique index if not exists businesses_slug_key on public.businesses (slug);

-- Storage bucket for business photos:
-- In Storage, create a PUBLIC bucket named 'business' then run:
--   create policy "public read business photos" on storage.objects for select using (bucket_id = 'business');
--   create policy "staff upload business" on storage.objects for insert to authenticated with check (bucket_id = 'business');
--   create policy "staff delete business" on storage.objects for delete to authenticated using (bucket_id = 'business');
