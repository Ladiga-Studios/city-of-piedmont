-- ============================================================
-- Newsletter subscribers table + policies
-- Run this in the Supabase SQL editor BEFORE using the signup form.
-- ============================================================

create table if not exists newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  source      text default 'website',
  subscribed_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table newsletter_subscribers enable row level security;

-- Allow ANYONE (anonymous website visitors) to INSERT a subscription.
-- They cannot read, update, or delete — only add their email.
drop policy if exists "public can subscribe" on newsletter_subscribers;
create policy "public can subscribe"
  on newsletter_subscribers
  for insert
  to anon, authenticated
  with check (true);

-- (Reading the list is done with the service role / Supabase dashboard, which
--  bypasses RLS, so no SELECT policy is needed for the public.)
