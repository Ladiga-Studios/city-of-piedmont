-- ============================================================
-- CITY OF PIEDMONT — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor).
-- ============================================================

-- ---------- COUNCIL MINUTES ----------
create table if not exists public.minutes (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  meeting_date  date not null,
  file_url      text not null,          -- public URL to the PDF in Storage
  file_path     text not null,          -- storage path (for deletion)
  created_at    timestamptz not null default now()
);

-- ---------- EVENTS ----------
create table if not exists public.events (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  event_date    timestamptz not null,
  location      text,
  description   text,
  created_at    timestamptz not null default now()
);

-- ---------- PUBLIC NOTICES ----------
create table if not exists public.notices (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  body          text,
  notice_type   text default 'general', -- general | bid | closure
  posted_date   date not null default current_date,
  created_at    timestamptz not null default now()
);

-- ---------- BUSINESS DIRECTORY ----------
create table if not exists public.businesses (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  category      text not null,          -- Dining | Retail | Outdoors | Services | Lodging
  description   text,
  address       text,
  phone         text,
  website       text,
  image_url     text,
  approved      boolean not null default false,  -- staff approves before public listing
  created_at    timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Public can READ; only authenticated staff can WRITE.
-- ============================================================
alter table public.minutes    enable row level security;
alter table public.events     enable row level security;
alter table public.notices    enable row level security;
alter table public.businesses enable row level security;

-- Public read access
create policy "public read minutes"    on public.minutes    for select using (true);
create policy "public read events"     on public.events     for select using (true);
create policy "public read notices"    on public.notices    for select using (true);
create policy "public read approved businesses" on public.businesses for select using (approved = true);

-- Authenticated (staff) full write access
create policy "staff write minutes"    on public.minutes    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "staff write events"     on public.events     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "staff write notices"    on public.notices    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "staff write businesses" on public.businesses for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Allow public to SUBMIT a business (unapproved) — optional public submission flow
create policy "public submit business" on public.businesses for insert with check (approved = false);

-- ============================================================
-- STORAGE BUCKET for minutes PDFs
-- Create a bucket named 'minutes' in Storage, set to PUBLIC, then run:
-- ============================================================
-- (Storage policies — run after creating the 'minutes' bucket)
-- Public can read PDFs:
--   create policy "public read minutes pdfs" on storage.objects for select using (bucket_id = 'minutes');
-- Staff can upload/delete:
--   create policy "staff upload minutes" on storage.objects for insert to authenticated with check (bucket_id = 'minutes');
--   create policy "staff delete minutes" on storage.objects for delete to authenticated using (bucket_id = 'minutes');
