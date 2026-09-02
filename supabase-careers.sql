-- ============================================================
-- CITY OF PIEDMONT — Job Postings (Careers console)
-- Run in the Supabase SQL editor. Safe to re-run.
--
-- Powers /admin/careers and the public /careers page. Staff upload the
-- job announcement (PDF or image), the site reads it and drafts the
-- overview, staff review and post. Each posting can also publish a
-- matching News article. Both disappear from the public site on their
-- own once the application deadline passes — no one has to remember.
--
-- HOW AUTO-EXPIRY WORKS
-- Expiry is enforced by row-level security, not by a scheduled job.
-- Public (anonymous) reads of job_postings and news simply can't see
-- rows whose expires_at is in the past. Signed-in staff still see them
-- in the admin console, marked "Expired", so nothing is silently lost.
-- ============================================================

-- ---------- JOB POSTINGS ----------
create table if not exists public.job_postings (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  department    text,
  deadline_date date not null,               -- last day to apply
  deadline_text text,                        -- as written on the flyer: "Friday, September 4, 2026 at 5:00 PM"
  summary       text not null,               -- 2-3 sentence overview
  duties        text[] not null default '{}',
  benefits      text,
  pay           text,
  apply_text    text,                        -- how/where to apply (emails and links are auto-linked)
  file_url      text,                        -- the announcement (public URL)
  file_path     text,                        -- storage path in 'careers' bucket (null for /images/* seeds)
  file_kind     text,                        -- 'pdf' | 'image'
  news_id       uuid references public.news (id) on delete set null,
  published     boolean not null default true,
  -- Set by trigger: postings stay visible through the whole deadline
  -- day (Central time), then vanish from the public site.
  expires_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists job_postings_expires_idx on public.job_postings (expires_at desc);

alter table public.job_postings enable row level security;

drop policy if exists "job postings public read" on public.job_postings;
drop policy if exists "job postings staff all"   on public.job_postings;

-- Public sees only live, unexpired postings.
create policy "job postings public read" on public.job_postings
  for select using (published = true and expires_at > now());
create policy "job postings staff all" on public.job_postings
  for all to authenticated using (true) with check (true);

-- ---------- STORAGE BUCKET (announcement PDFs/images, public) ----------
insert into storage.buckets (id, name, public)
values ('careers', 'careers', true)
on conflict (id) do nothing;

drop policy if exists "careers bucket public read" on storage.objects;
drop policy if exists "careers bucket staff write" on storage.objects;
create policy "careers bucket public read" on storage.objects
  for select using (bucket_id = 'careers');
create policy "careers bucket staff write" on storage.objects
  for all to authenticated
  using (bucket_id = 'careers') with check (bucket_id = 'careers');

-- ---------- NEWS: optional expiry ----------
-- A news item with expires_at set vanishes from the public site (home
-- page, news list, article page, search, sitemap) after that moment.
-- Job-posting articles use it; any other article can too.
alter table public.news add column if not exists expires_at timestamptz;
create index if not exists news_expires_idx on public.news (expires_at);

drop policy if exists "public read news" on public.news;
create policy "public read news" on public.news
  for select using (expires_at is null or expires_at > now());
-- (the existing "staff write news" policy is FOR ALL, so staff keep full read access)

-- ---------- expires_at + updated_at ----------
create or replace function public.job_postings_touch()
returns trigger language plpgsql as $$
begin
  new.expires_at = (new.deadline_date + 1)::timestamp at time zone 'America/Chicago';
  new.updated_at = now();
  return new;
end $$;
drop trigger if exists job_postings_touch on public.job_postings;
create trigger job_postings_touch before insert or update on public.job_postings
  for each row execute function public.job_postings_touch();

-- ---------- SEED: the opening currently hard-coded on /careers ----------
insert into public.job_postings
  (title, department, deadline_date, deadline_text, summary, duties, benefits, apply_text, file_url, file_kind, published)
select
  'Recreation Coordinator',
  'Parks & Recreation',
  '2026-09-04',
  'Friday, September 4, 2026 at 5:00 PM',
  E'Runs Piedmont\u2019s league sports and youth programs end to end: scheduling and registration, recruiting coaches and participants, supervising Aquatic Center staff during swim season, maintaining the Sports Complex, and serving as point of contact for partner leagues.',
  array[
    'Organize, schedule, and market league sports, tournaments, and youth clinics',
    'Manage registrations, fees, rosters, and records for each season',
    'Supervise Aquatic Center employees; maintain pool chemical levels; open/close during swim season',
    'Maintain sports equipment, Sports Complex fields and buildings, and the city vehicle',
    E'Run the department\u2019s social media; support the Civic Center front desk as needed'
  ],
  'RSA/State Retirement; vacation, sick, and personal time accrued; BC/BS health, dental, and vision insurance',
  'Apply in person at the Piedmont Administration Office, 109 N Center Ave, Piedmont, AL, or email City Clerk Tashia Blackerby at tashia.blackerby@piedmontcity.org.',
  '/images/news/recreation-coordinator-2026.webp',
  'image',
  true
where not exists (select 1 from public.job_postings where title = 'Recreation Coordinator' and deadline_date = '2026-09-04');

-- Link it to the news article that already exists for it, and give that
-- article the same expiry so both drop off together on Sept 4.
update public.news
set expires_at = ('2026-09-05'::timestamp at time zone 'America/Chicago')
where slug = 'recreation-coordinator-opening-2026' and expires_at is null;

update public.job_postings j
set news_id = n.id
from public.news n
where n.slug = 'recreation-coordinator-opening-2026'
  and j.title = 'Recreation Coordinator' and j.news_id is null;
