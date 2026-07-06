-- ============================================================
-- CITY OF PIEDMONT — Public Notices & Bid Requests
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor).
--
-- This adds the table + storage policies behind the public
-- "Public Notices & Bids" page and the /admin/notices console.
--
-- NOTE: this is a SEPARATE feature from the existing `notices`
-- table, which powers site-wide ALERT BANNERS. To avoid any
-- collision we use `public_notices` here.
-- ============================================================

-- ---------- PUBLIC NOTICES & BID REQUESTS ----------
create table if not exists public.public_notices (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  category      text not null default 'notice',  -- 'notice' | 'bid'
  posted_date   date not null default current_date,
  -- Optional bid-specific fields (ignored for plain notices):
  closes_date   date,                            -- bid submission deadline, if any
  -- PDF in Storage:
  file_url      text not null,                   -- public URL to the PDF
  file_path     text not null,                   -- storage path (for deletion)
  created_at    timestamptz not null default now()
);

create index if not exists public_notices_category_idx on public.public_notices (category);
create index if not exists public_notices_posted_idx   on public.public_notices (posted_date desc);

-- ---------- ROW LEVEL SECURITY ----------
-- Public can READ; only authenticated staff can WRITE.
alter table public.public_notices enable row level security;

create policy "public read public_notices"
  on public.public_notices for select using (true);

create policy "staff write public_notices"
  on public.public_notices for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKET for the PDFs
-- Create a PUBLIC bucket named 'notices-files' in Storage
-- (Dashboard > Storage > New bucket > Public), then run:
-- ============================================================
-- Public can read the PDFs:
--   create policy "public read notice files"
--     on storage.objects for select
--     using (bucket_id = 'notices-files');
--
-- Staff can upload:
--   create policy "staff upload notice files"
--     on storage.objects for insert to authenticated
--     with check (bucket_id = 'notices-files');
--
-- Staff can delete:
--   create policy "staff delete notice files"
--     on storage.objects for delete to authenticated
--     using (bucket_id = 'notices-files');

-- ============================================================
-- OPTIONAL: seed the three notices currently on the live site.
-- These reference the PDFs already hosted on piedmontcity.org,
-- so they work immediately even before anything is re-uploaded.
-- Re-upload them through /admin/notices when convenient to move
-- the files into your own Storage bucket.
-- ============================================================
insert into public.public_notices (title, category, posted_date, file_url, file_path)
values
  ('Ordinance 640 — Prohibiting Brown Bagging Alcoholic Beverages', 'notice', '2025-04-15',
   'https://www.piedmontcity.org/wp-content/uploads/2025/04/ORDINANCE-640-PROHIBITING-BROWN-BAGGING-ALCOHOLIC-BEVERAGES.pdf',
   'external/ORDINANCE-640-PROHIBITING-BROWN-BAGGING-ALCOHOLIC-BEVERAGES.pdf'),
  ('Ordinance 639 — Prohibiting THC Products', 'notice', '2025-04-15',
   'https://www.piedmontcity.org/wp-content/uploads/2025/04/ORDINANCE-639-PROHIBITING-THC-PRODUCTS.pdf',
   'external/ORDINANCE-639-PROHIBITING-THC-PRODUCTS.pdf'),
  ('Ordinance 636 — Short-Term Rentals', 'notice', '2023-02-07',
   'https://www.piedmontcity.org/wp-content/uploads/2023/03/ORDINANCE-636-SHORT-TERM-RENTALS.pdf',
   'external/ORDINANCE-636-SHORT-TERM-RENTALS.pdf')
on conflict do nothing;
