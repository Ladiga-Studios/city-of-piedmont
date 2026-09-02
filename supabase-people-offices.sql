-- ============================================================
-- CITY OF PIEDMONT — People: offices / divisions
-- Run in the Supabase SQL editor. Safe to re-run.
--
-- Some department pages have sub-offices with their own staff list:
--   Public Safety  → Police Department, Fire Department
-- Those chiefs were on the site (hard-coded) but not in the People
-- console. This adds an `office` field so a person can be placed in a
-- specific office on their department page, and seeds the Police and
-- Fire chiefs so everyone on the site is now editable at /admin/people.
-- ============================================================

alter table public.people add column if not exists office text;

insert into public.people (name, role, group_type, department_slug, office, sort_order)
select 'Nathan Johnson', 'Chief of Police', 'staff', 'public-safety', 'Police Department', 1
where not exists (select 1 from public.people where name = 'Nathan Johnson' and department_slug = 'public-safety');

insert into public.people (name, role, group_type, department_slug, office, sort_order)
select 'Todd Kirkland', 'Fire Chief', 'staff', 'public-safety', 'Fire Department', 1
where not exists (select 1 from public.people where name = 'Todd Kirkland' and department_slug = 'public-safety');
