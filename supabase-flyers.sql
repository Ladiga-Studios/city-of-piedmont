-- ============================================================
-- CITY OF PIEDMONT — Bulletin Board flyers
-- Run in the Supabase SQL editor. Safe to re-run.
--
-- Powers the homepage "On the Bulletin Board" section and the
-- /admin/flyers console. The homepage shows the 3 NEWEST ACTIVE
-- flyers; staff can keep older ones in the list switched off.
-- ============================================================

-- ---------- TABLE ----------
create table if not exists public.flyers (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  caption      text,                -- one line: date/time/place or deadline
  image_url    text not null,       -- flyer preview image
  image_width  int,
  image_height int,
  link_url     text,                -- PDF, page, or external link
  link_label   text,                -- e.g. "View flyer", "See the posting"
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table public.flyers enable row level security;

-- Public (anon) can read active flyers; staff can do everything.
drop policy if exists "flyers public read"  on public.flyers;
drop policy if exists "flyers staff all"    on public.flyers;
create policy "flyers public read" on public.flyers
  for select using (active = true);
create policy "flyers staff all" on public.flyers
  for all to authenticated using (true) with check (true);

-- ---------- STORAGE BUCKET (flyer images + PDFs uploaded from admin) ----------
insert into storage.buckets (id, name, public)
values ('flyers', 'flyers', true)
on conflict (id) do nothing;

drop policy if exists "flyers bucket public read" on storage.objects;
drop policy if exists "flyers bucket staff write" on storage.objects;
create policy "flyers bucket public read" on storage.objects
  for select using (bucket_id = 'flyers');
create policy "flyers bucket staff write" on storage.objects
  for all to authenticated
  using (bucket_id = 'flyers') with check (bucket_id = 'flyers');

-- ---------- SEED: the two flyers currently on the board ----------
-- These reference images/PDFs served by the site itself (already deployed),
-- so the board looks identical after switching to the database.
insert into public.flyers (title, caption, image_url, image_width, image_height, link_url, link_label, active)
select 'Downtown Trick or Treat', 'Oct 31 · 5:00–7:00 PM · Downtown Piedmont',
       '/images/flyers/downtown-halloween-2026.webp', 640, 828,
       '/documents/downtown-halloween-2026-flyer.pdf', 'View flyer', true
where not exists (select 1 from public.flyers where title = 'Downtown Trick or Treat');

insert into public.flyers (title, caption, image_url, image_width, image_height, link_url, link_label, active)
select 'Now Hiring: Recreation Coordinator', 'Apply by Fri, Sept 4 · Parks & Recreation',
       '/images/flyers/recreation-coordinator-2026.webp', 546, 900,
       '/careers', 'See the posting', true
where not exists (select 1 from public.flyers where title = 'Now Hiring: Recreation Coordinator');
