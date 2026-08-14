-- ============================================================
-- CITY OF PIEDMONT — People & City Documents
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor).
--
-- Adds two admin-managed content types requested at the August
-- 2026 City Hall walkthrough:
--
--   1. people          Mayor, council members, and department
--                      staff. Managed at /admin/people. The
--                      public council page and department pages
--                      read from this table, so staff changes
--                      (hires, moves, retirements) no longer
--                      require a code change.
--
--   2. city_documents  Any PDF/DOC the city needs to publish:
--                      water quality reports, permit forms,
--                      applications, zoning docs, etc. Managed
--                      at /admin/documents. Files appear in the
--                      Downloads area of the department page you
--                      assign them to.
-- ============================================================

-- ---------- PEOPLE ----------
create table if not exists public.people (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  role            text not null,                  -- 'Mayor', 'District 3', 'Utility Clerk', ...
  group_type      text not null default 'staff',  -- 'council' | 'staff'
  department_slug text,                           -- staff only: which department page they show on
  sort_order      int  not null default 100,      -- lower = earlier in the list
  email           text,
  phone           text,
  bio             text,                           -- optional "get to know them" paragraph(s)
  photo_url       text,
  photo_path      text,                           -- storage path (for deletion); null for /images/* seeds
  featured        boolean not null default false, -- true = the Mayor card
  created_at      timestamptz not null default now()
);

create index if not exists people_group_idx on public.people (group_type, sort_order);
create index if not exists people_dept_idx  on public.people (department_slug);

alter table public.people enable row level security;

create policy "public read people"
  on public.people for select using (true);

create policy "staff write people"
  on public.people for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------- CITY DOCUMENTS ----------
create table if not exists public.city_documents (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  department_slug text not null,                     -- which department page shows it
  group_heading   text not null default 'Documents', -- e.g. 'Water Quality Reports', 'Download Forms'
  posted_date     date not null default current_date,
  file_url        text not null,
  file_path       text not null,                     -- storage path (for deletion)
  created_at      timestamptz not null default now()
);

create index if not exists city_documents_dept_idx on public.city_documents (department_slug, group_heading, posted_date desc);

alter table public.city_documents enable row level security;

create policy "public read city_documents"
  on public.city_documents for select using (true);

create policy "staff write city_documents"
  on public.city_documents for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKETS
-- Create two PUBLIC buckets in Storage
-- (Dashboard > Storage > New bucket > Public):
--   people-photos    headshots uploaded from /admin/people
--   city-documents   PDFs/DOCs uploaded from /admin/documents
-- then run:
-- ============================================================
create policy "public read people photos"
  on storage.objects for select
  using (bucket_id = 'people-photos');

create policy "staff upload people photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'people-photos');

create policy "staff delete people photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'people-photos');

create policy "public read city documents"
  on storage.objects for select
  using (bucket_id = 'city-documents');

create policy "staff upload city documents"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'city-documents');

create policy "staff delete city documents"
  on storage.objects for delete to authenticated
  using (bucket_id = 'city-documents');

-- ============================================================
-- SEED — current mayor, council, and staff (reflects the staff
-- moves confirmed at the walkthrough: Patti Byers to the utility
-- office, Brittany Humphrey to the Civic Center). Photos point at
-- images already shipped with the site; replace them any time
-- from /admin/people.
-- ============================================================

-- Council (bios are blank on purpose — the Mayor is sending a short
-- paragraph for each member; paste them in at /admin/people).
insert into public.people (name, role, group_type, sort_order, featured, photo_url) values
  ('Kevin Farmer',      'Mayor',      'council', 0, true,  '/images/council/kevin-farmer.jpg'),
  ('Brittney Williams', 'District 1', 'council', 1, false, '/images/council/brittney-williams.jpg'),
  ('Kevin McCord',      'District 2', 'council', 2, false, '/images/council/kevin-mccord.jpg'),
  ('Frank Cobb',        'District 3', 'council', 3, false, '/images/council/frank-cobb.jpg'),
  ('Mark Epps',         'District 4', 'council', 4, false, '/images/council/mark-epps.jpg'),
  ('Greg South',        'District 5', 'council', 5, false, '/images/council/greg-south.jpg'),
  ('Carlos Farmer',     'District 6', 'council', 6, false, '/images/council/carlos-farmer.jpg'),
  ('Matt Rogers',       'District 7', 'council', 7, false, '/images/council/matt-rogers.jpg');

-- Department staff
insert into public.people (name, role, group_type, department_slug, sort_order, email, phone) values
  -- Administrative
  ('Leanne Pike',       'Accounts Payable',                'staff', 'administrative', 1, 'leanne.pike@piedmontcity.org', null),
  ('Tessa Maddox',      'Accounting/Payroll',              'staff', 'administrative', 2, 'tessa.maddox@piedmontcity.org', null),
  ('Amy Rawson',        'Business License/Revenue',        'staff', 'administrative', 3, 'amy.rawson@piedmontcity.org', '(256) 447-3564'),
  ('Tashia Blackerby',  'City Clerk',                      'staff', 'administrative', 4, 'tashia.blackerby@piedmontcity.org', null),
  ('Ben Singleton',     'IT Manager/Building and Zoning',  'staff', 'administrative', 5, 'ben.singleton@piedmontcity.org', null),
  -- Power & Light
  ('Corey Horton',      'Electrical Manager',              'staff', 'power-light', 1, null, null),
  -- Water & Gas (utility office: Byrian, Tammy, Mackenzie, Patti)
  ('Byrian Watts',      'Water, Gas, & Sewer Manager',     'staff', 'water-gas', 1, 'abwatts@piedmontcity.org', null),
  ('Tammy Maddox',      'Utility Clerk',                   'staff', 'water-gas', 2, 'tammy.maddox@piedmontcity.org', null),
  ('Mackenzie Hightower','Utility Clerk',                  'staff', 'water-gas', 3, 'mackenzie.hightower@piedmontcity.org', null),
  ('Patti Byers',       'Utility Clerk',                   'staff', 'water-gas', 4, 'patti.byers@piedmontcity.org', null),
  -- Revenue
  ('Amy Rawson',        'Revenue Officer',                 'staff', 'revenue', 1, 'amy.rawson@piedmontcity.org', '(256) 447-3564'),
  -- Municipal Court
  ('Janet Henson',      'Court Clerk',                     'staff', 'municipal-court', 1, 'janet.henson@piedmontcity.org', null),
  ('Susan Glover',      'Court Magistrate',                'staff', 'municipal-court', 2, 'susan.glover@piedmontcity.org', null),
  -- Public Works
  ('Tim Frost',         'Public Works/Sanitation Supervisor','staff', 'public-works', 1, null, '(256) 447-3572'),
  ('Henry Reynolds',    'Maintenance Supervisor',          'staff', 'public-works', 2, null, '(256) 447-3583'),
  -- Building Inspection
  ('Ben Singleton',     'Building Inspector',              'staff', 'building-inspection', 1, 'ben.singleton@piedmontcity.org', '256-447-3582'),
  ('Tashia Blackerby',  'City Clerk',                      'staff', 'building-inspection', 2, 'tashia.blackerby@piedmontcity.org', '256-447-3596'),
  ('Charles McDonald',  'Code Enforcement Officer',        'staff', 'building-inspection', 3, 'charles.mcdonald@piedmontcity.org', '(256) 447-3562'),
  -- Public Library
  ('Donna Garmon',      'Library Director',                'staff', 'public-library', 1, 'donna.garmon@piedmontcity.org', null),
  ('Cathy Posey',       'Clerk',                           'staff', 'public-library', 2, null, null),
  -- Civic Center
  ('Brittany Humphrey', 'Membership Coordinator',          'staff', 'civic-center', 1, 'brittany.humphrey@piedmontcity.org', null);

-- ============================================================
-- OPTIONAL CLEANUP — business directory
-- Confirmed at the walkthrough: Irvin Funeral Home and Dansby
-- have both closed; Thompson is the only funeral home left.
-- You can remove them from /admin/businesses, or run:
-- ============================================================
-- update public.businesses set approved = false
--   where name ilike '%irvin%funeral%' or name ilike '%dansby%';
